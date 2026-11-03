import { useId } from 'react';
import type { AiSuggestedDish, AiSuggestedIngredient } from '@cookora/contracts';
import { Check, ChefHat, Clock3, Info, Plus, ShoppingBasket, Signal, Sparkles, Users } from 'lucide-react';
import { Modal } from '../shared';
import '../ai-dish-dialog.css';

function IngredientList({ items, available }: { items: AiSuggestedIngredient[]; available: boolean }) {
  return (
    <section className={`ai-recipe-ingredient-group${available ? ' is-available' : ''}`}>
      <div className="ai-recipe-group-heading">
        <span>{available ? <Check size={15} /> : <Plus size={15} />}</span>
        <h4>{available ? 'Nguyên liệu đã có' : 'Cần chuẩn bị thêm'}</h4>
        <small>{items.length}</small>
      </div>
      {items.length ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <div>
                <span>{item.name}</span>
                {item.note && <small>{item.note}</small>}
              </div>
              <strong>
                {item.quantity ? [item.quantity, item.unit].filter(Boolean).join(' ') : 'Chưa rõ lượng'}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ai-recipe-empty">
          {available ? 'Chưa có nguyên liệu được ghi nhận.' : 'Không cần chuẩn bị thêm nguyên liệu.'}
        </p>
      )}
    </section>
  );
}

export function AiDishDialog({ dish, onClose }: { dish: AiSuggestedDish; onClose: () => void }) {
  const ingredientsId = useId();
  const methodId = useId();
  return (
    <Modal
      title={dish.title}
      onClose={onClose}
      className="ai-recipe-dialog"
      eyebrow={
        <>
          <Sparkles size={14} aria-hidden="true" />
          Gợi ý từ Cookora AI
        </>
      }
    >
      <div className="ai-recipe-scroll">
        <section className="ai-recipe-intro" aria-label="Thông tin món ăn">
          {dish.summary && <p className="ai-recipe-summary">{dish.summary}</p>}
          <dl className="ai-recipe-stats">
            <div>
              <dt>
                <span>
                  <Clock3 size={19} aria-hidden="true" />
                </span>
                Tổng thời gian
              </dt>
              <dd>
                {dish.totalMinutes}
                <small>phút</small>
              </dd>
            </div>
            <div>
              <dt>
                <span>
                  <Users size={19} aria-hidden="true" />
                </span>
                Khẩu phần
              </dt>
              <dd>
                {dish.servings}
                <small>người</small>
              </dd>
            </div>
            <div>
              <dt>
                <span>
                  <Signal size={19} aria-hidden="true" />
                </span>
                Độ khó
              </dt>
              <dd>{dish.difficulty}</dd>
            </div>
          </dl>
          <div className="ai-recipe-source-note">
            <Info size={16} aria-hidden="true" />
            <p>Công thức ngoài kho do AI đề xuất, chưa được Cookora biên tập hoặc nấu thử.</p>
          </div>
        </section>
        <div className="ai-recipe-layout">
          <aside className="ai-recipe-ingredients" aria-labelledby={ingredientsId}>
            <div className="ai-recipe-section-heading">
              <ShoppingBasket size={21} aria-hidden="true" />
              <div>
                <h3 id={ingredientsId}>Chuẩn bị nguyên liệu</h3>
                <p>Cho {dish.servings} người ăn</p>
              </div>
            </div>
            <IngredientList items={dish.usedIngredients} available />
            <IngredientList items={dish.pantryIngredientsNeeded} available={false} />
          </aside>
          <section className="ai-recipe-method" aria-labelledby={methodId}>
            <div className="ai-recipe-section-heading">
              <ChefHat size={22} aria-hidden="true" />
              <div>
                <h3 id={methodId}>Cùng vào bếp nào</h3>
                <p>{dish.steps.length} bước thực hiện</p>
              </div>
            </div>
            {dish.steps.length ? (
              <ol className="ai-recipe-steps">
                {dish.steps.map((step, index) => (
                  <li key={index}>
                    <span className="ai-recipe-step-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4>{step.title}</h4>
                      <p>{step.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="ai-recipe-empty">Chưa có hướng dẫn cho món này.</p>
            )}
          </section>
        </div>
      </div>
      <footer className="ai-recipe-footer">
        <p>
          <ChefHat size={17} aria-hidden="true" />
          Chúc bạn có một bữa ăn ngon!
        </p>
        <button type="button" onClick={onClose}>
          Đóng công thức
          <Check size={16} aria-hidden="true" />
        </button>
      </footer>
    </Modal>
  );
}
