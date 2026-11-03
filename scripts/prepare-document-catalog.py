"""Read the six user documents without modifying them; compile recipes and embedded photos."""
import argparse
import collections
import hashlib
import io
import json
import pathlib
import posixpath
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = [('viet.docx', 'viet', 'VN'), ('han.docx', 'han', 'KR'),
           ('nhat.docx', 'nhat', 'JP'), ('Trung.docx', 'trung', 'CN'),
           ('Thai.docx', 'thai', 'TH'), ('Menu món.docx', 'menu', 'VN')]
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
METHOD = re.compile(r'^(?:Cách làm(?: chi tiết)?|Cách chế biến|Công thức)(?:\s*:|\s*$)', re.I)
INGREDIENTS = re.compile(r'^Nguyên liệu(?:\s*\([^)]*\))?\s*[:：]?', re.I)
TITLE = re.compile(r'^\d+[.)]\s+|^\.\s+Cơm|^Salad ức gà và bơ$')
NUMBER = r'(?:\d+\s*/\s*\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])'
UNIT = r'(?:thìa cà phê|muỗng cà phê|thìa canh|muỗng canh|thìa cafe|muỗng cafe|lít|kg|ml|gam|gr|g|l|quả|củ|tép|cây|con|lá|lát|bó|bát|chén|miếng|nhánh|viên|chiếc|cái|gói|hộp|tấm|tô|bông|sợi|nhúm)'
AMOUNT = re.compile(rf'^({NUMBER})(?:\s*[-–—]\s*({NUMBER}))?\s*({UNIT})(?=\s|[^a-zA-Z]|$)\s*(.*)$', re.I)


def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text.replace('đ', 'd').replace('Đ', 'D'))
                   if unicodedata.category(c) != 'Mn').lower()


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', normalized(text)).strip('-')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def split_ingredients(text):
    result, depth, start = [], 0, 0
    for i, char in enumerate(text):
        if char in '([':
            depth += 1
        elif char in ')]':
            depth = max(0, depth - 1)
        elif depth == 0 and (char == ';' or (char == ',' and not (
                i > 0 and i + 1 < len(text) and text[i - 1].isdigit() and text[i + 1].isdigit()))):
            result.append(text[start:i].strip())
            start = i + 1
    result.append(text[start:].strip())
    return [item for item in result if item]


def ingredient(raw, index, seasoning=False):
    text = raw.strip().strip('•- ').rstrip('.;')
    match = AMOUNT.match(text)
    name = None
    if not match and ':' in text:
        left, right = text.split(':', 1)
        match = AMOUNT.match(right.strip())
        if match:
            # Chinese lists use "name: amount"; Korean fillings use "Nhân: amount name".
            name = match[4].strip() or left.strip()
    quantity, unit = None, 'piece'
    if match:
        name = name or match[4].strip()
        raw_unit = match[3].lower()
        if raw_unit in ['g', 'gam', 'gr', 'kg']:
            unit, factor = 'g', 1000 if raw_unit == 'kg' else 1
        elif raw_unit in ['ml', 'l', 'lít']:
            unit, factor = 'ml', 1 if raw_unit == 'ml' else 1000
        elif raw_unit.startswith(('thìa', 'muỗng')):
            unit, factor = 'ml', 15 if raw_unit.endswith('canh') else 5
        else:
            factor = 1
        if not match[2]:
            token = match[1].replace(' ', '').replace(',', '.')
            token = {'½': '1/2', '¼': '1/4', '¾': '3/4', '⅓': '1/3', '⅔': '2/3'}.get(token, token)
            fraction = Fraction(token)
            value = Decimal(fraction.numerator) / Decimal(fraction.denominator) * factor
            if value > 0:
                quantity = format(value.quantize(Decimal('0.000001'), rounding=ROUND_HALF_UP), 'f').rstrip('0').rstrip('.')
    if not name:
        name = text
    key = normalized(name)
    is_seasoning = seasoning or bool(re.search(r'dau an|dau me|dau o|nuoc mam|nuoc tuong|xi dau|muoi|duong|hat nem|tieu|bot ngot|dau hao|giam|mirin|sake|sot |tuong ', key))
    return {'name': name, 'quantity': quantity, 'unit': unit, 'note': text,
            'role': 'SEASONING' if is_seasoning else 'MAIN' if index == 0 else 'SUPPORTING'}


def category(title, section):
    text = normalized(title)
    section = normalized(section)
    if ('trang mieng' in section or re.search(r'^(che |kem |thach |banh (flan|chuoi|sua|tai yen|duc la dua)|chuoi nep)', text)) and not re.search(r'^(mi |bun |com |lau |canh |thit |ga |trung |ca kho|chan gio)', text):
        return 'Tráng miệng & món ngọt'
    if re.search(r'canh |ca ri|lau |sup |tom yum|tom kha|jjigae|guk|tang', text):
        return 'Canh, cà ri & lẩu'
    if re.search(r'^(com |bun |mi |mien |pho |hu tieu|cao lau|chao )|gimbap|bibimbap|bokkeumbap|jumeokbap|myeon|kalguksu|makguksu|khao pad|khao man|pad thai|pad see|pad kee|rad na|pad woon|khanom jeen', text):
        return 'Cơm, mì & bún'
    if re.search(r'^salad|goi |banh |rau |dau phu |dau hu |khoai |kimchi|muchim|mandu|sundae|eomuk|oduk|tteok|rabokki|hotteok|gyeran|som tam|larb|nam tok|yam |tod man|poh pia|pak boong|khai jiao', text):
        return 'Gỏi & món ăn nhẹ'
    return 'Thịt & hải sản'


def duration(text):
    if not text:
        return None
    text = re.split(r'Khẩu phần:', text, flags=re.I)[0].split('(')[0]
    values = re.findall(r'(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(giờ|tiếng|phút)', text, re.I)
    if not values:
        return None
    return int(sum(float((high or low).replace(',', '.')) * (60 if unit.lower() in ['giờ', 'tiếng'] else 1)
                   for low, high, unit in values))


def read_source(path, key, cuisine, image_root):
    with zipfile.ZipFile(path) as archive:
        relationships = {r.attrib['Id']: dict(r.attrib) for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}
        document = ET.fromstring(archive.read('word/document.xml'))
        paragraphs = []
        for p in document.findall('.//w:body//w:p', NS):
            text = ''.join(t.text or '' for t in p.findall('.//w:t', NS)).strip()
            images = [b.attrib.get('{'+NS['r']+'}embed') for b in p.findall('.//a:blip', NS)]
            images = list(dict.fromkeys(im for im in images if im))
            if text or images:
                paragraphs.append({'text': text, 'images': images})
        candidates = [i for i, p in enumerate(paragraphs) if TITLE.match(p['text'])]
        starts = []
        for index, start in enumerate(candidates):
            stop = candidates[index + 1] if index + 1 < len(candidates) else len(paragraphs)
            for p in paragraphs[start + 1:min(stop, start + 18)]:
                if METHOD.match(p['text']):
                    break
                if INGREDIENTS.match(p['text']):
                    starts.append(start)
                    break
        recipes = []
        section = ''
        for index, start in enumerate(starts):
            stop = starts[index + 1] if index + 1 < len(starts) else len(paragraphs)
            for p in paragraphs[(starts[index - 1] if index else 0):start]:
                if re.match(r'^PHẦN|^[IVX]+\.|^\d+\. Món ', p['text']):
                    section = p['text']
            block = paragraphs[start:stop]
            heading = block[0]['text']
            title = re.sub(r'^(?:\d+[.)]|\.)\s*', '', heading).strip().rstrip('\\')
            recipe_slug = f'doc-{key}-{index + 1:03d}-{slug(title)[:115]}'
            method_index = next(i for i, p in enumerate(block) if METHOD.match(p['text']))
            ingredient_index = next(i for i, p in enumerate(block) if INGREDIENTS.match(p['text']))
            raw_ingredients = []
            lines = []
            for p in block[ingredient_index:method_index]:
                text = p['text']
                if not text or re.match(r'^(Khẩu phần|Thời gian|PHẦN)', text):
                    continue
                seasoning = text.startswith('Gia vị:')
                raw_ingredients.append(text)
                text = INGREDIENTS.sub('', text) if not seasoning else text.removeprefix('Gia vị:')
                if text.strip():
                    lines.extend((item, seasoning) for item in split_ingredients(text))
            steps = []
            inline_method = METHOD.sub('', block[method_index]['text']).strip()
            texts = ([inline_method] if inline_method else []) + [p['text'] for p in block[method_index + 1:]]
            for text in texts:
                if not text:
                    continue
                if re.match(r'^(Từ các món tiếp theo|làm thêm 50|T sẽ bổ sung|Các món được chia|2/2)', text):
                    break
                if re.match(r'^(Khẩu phần|Thời gian|PHẦN|[IVX]+\.|\d+\. Món )', text):
                    continue
                instruction = re.sub(r'^(?:Bước\s*)?\d+[.)]\s*', '', text).strip()
                if instruction:
                    step_title = instruction.split(':', 1)[0] if ':' in instruction and len(instruction.split(':', 1)[0]) < 100 else f'Bước {len(steps) + 1}'
                    steps.append({'order': len(steps) + 1, 'title': step_title, 'instruction': instruction})
            metadata = [p['text'] for p in block if re.match(r'^(Khẩu phần|Thời gian|\d+\s*(?:[-–]\s*\d+)?\s*(phút|giờ))', p['text'])]
            time_text = next((t for t in metadata if 'Thời gian:' in t), next((t for t in metadata if 'phút' in t or 'giờ' in t), ''))
            if 'Thời gian:' in time_text:
                time_text = time_text.split('Thời gian:', 1)[1].strip()
            all_text = '\n'.join(p['text'] for p in block)
            serving_match = re.search(r'(?:Khẩu phần:\s*|Nguyên liệu\s*\()(\d+)\s*người', all_text, re.I)
            servings = int(serving_match[1]) if serving_match else 1
            assumption = '' if serving_match or key == 'thai' else 'Nguồn chưa ghi số khẩu phần; tạm tính 1 phần. '
            image_ids = list(dict.fromkeys(im for p in block for im in p['images']))
            images = []
            for ordinal, rid in enumerate(image_ids):
                rel = relationships[rid]
                if rel.get('TargetMode') == 'External':
                    continue
                target = posixpath.normpath(posixpath.join('word', rel['Target']))
                if not target.startswith('word/media/'):
                    raise ValueError(f'Unexpected embedded image target: {target}')
                original = archive.read(target)
                filename = f'{recipe_slug}-{ordinal + 1}.webp'
                output = image_root / filename
                with Image.open(io.BytesIO(original)) as im:
                    im = ImageOps.exif_transpose(im).convert('RGB')
                    im.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
                    im.save(output, 'WEBP', quality=86, method=5)
                images.append({'path': '/recipes/documents/' + filename, 'sourceAsset': target,
                               'sourceSha256': digest(original), 'sha256': digest(output.read_bytes())})
            recipe_cuisine = cuisine
            if key == 'menu':
                n = normalized(title)
                recipe_cuisine = 'KR' if 'kimchi' in n else 'JP' if 'ramen' in n or 'udon' in n else 'IT' if 'mi y' in n else 'WE' if n.startswith('salad') else 'VN'
            if not lines or not steps:
                raise ValueError(f'Incomplete source content: {heading}')
            recipes.append({'slug': recipe_slug, 'sourceKey': key, 'sourceOrdinal': index + 1,
                            'sourceNumber': re.match(r'^\d+', heading)[0] if re.match(r'^\d+', heading) else None,
                            'sourceName': path.name, 'title': title, 'cuisine': recipe_cuisine,
                            'category': category(title, section), 'section': section,
                            'summary': f'Công thức từ {path.name}. ' + (' · '.join(metadata) if metadata else 'Định lượng và cách làm theo tài liệu gốc.'),
                            'baseServings': servings, 'totalMinutes': duration(time_text),
                            'timeText': time_text, 'preconditions': assumption + (f'Thời gian gốc: {time_text} ' if time_text else 'Nguồn chưa ghi thời gian. ') + 'Chưa kiểm chứng qua nấu thử.',
                            'image': images[0]['path'] if images else '', 'images': images,
                            'imageCredit': f'Ảnh trong tài liệu {path.name}' if images else 'Tài liệu gốc chưa có ảnh cho món này',
                            'rawIngredients': '\n'.join(raw_ingredients),
                            'ingredients': [ingredient(item, i, seasoning) for i, (item, seasoning) in enumerate(lines)],
                            'steps': steps, 'sourceParagraphs': block})
        return {'name': path.name, 'key': key, 'sha256': hashlib.file_digest(path.open('rb'), 'sha256').hexdigest(),
                'recipeCount': len(recipes), 'embeddedImageCount': len([i for i in archive.namelist() if i.startswith('word/media/')]),
                'missingImages': [r['slug'] for r in recipes if not r['image']]}, recipes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=pathlib.Path, default=pathlib.Path('C:/Users/reiko/Downloads'))
    args = parser.parse_args()
    image_root = ROOT / 'frontend/public/recipes/documents'
    image_root.mkdir(parents=True, exist_ok=True)
    manifest = {'version': 1, 'sources': [], 'recipes': []}
    for filename, key, cuisine in SOURCES:
        source, recipes = read_source(args.source_dir / filename, key, cuisine, image_root)
        manifest['sources'].append(source)
        manifest['recipes'].extend(recipes)
        print(json.dumps({'source': filename, 'recipes': len(recipes), 'withImages': sum(bool(r['image']) for r in recipes)}, ensure_ascii=False), flush=True)
    output = ROOT / 'database/seeds/document-recipes.json'
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps({'total': len(manifest['recipes']), 'cuisines': dict(collections.Counter(r['cuisine'] for r in manifest['recipes'])),
                      'withImages': sum(bool(r['image']) for r in manifest['recipes']),
                      'imageFiles': sum(len(r['images']) for r in manifest['recipes']),
                      'unknownQuantities': sum(i['quantity'] is None for r in manifest['recipes'] for i in r['ingredients']),
                      'output': str(output)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
