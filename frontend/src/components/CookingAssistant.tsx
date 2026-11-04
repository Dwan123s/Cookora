import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight, Calendar, ChefHat, Dumbbell, Leaf, Lightbulb, LoaderCircle, MessageCircle, Minus, Send, Sparkles, X } from 'lucide-react';
import type { AiChatMessage, AiChefSuggestionResponse, AiSuggestedDish } from '@cookora/contracts';
import { ApiError, request } from '../api';
import { errorText } from '../shared';
import { assistantHistory, type AssistantExchange } from '../assistant-conversation';
import { AiDishDialog } from './AiDishDialog';
import '../cooking-assistant.css';

type ChatRequest = { id: number; prompt: string; servings: number; history: AiChatMessage[] };

export function CookingAssistant({ hidden = false }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [servings, setServings] = useState(2);
  const [exchanges, setExchanges] = useState<AssistantExchange[]>([]);
  const [detail, setDetail] = useState<AiSuggestedDish | null>(null);
  const nextId = useRef(0);
  const sending = useRef(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();
  const inputId = useId();
  const servingsId = useId();
  const chat = useMutation({
    mutationFn: ({ id: _id, ...body }: ChatRequest) =>
      request<AiChefSuggestionResponse>('/ai/suggest-recipes', { method: 'POST', body }),
    onSuccess: (result, variables) =>
      setExchanges((previous) =>
        previous.map((exchange) =>
          exchange.id === variables.id ? { ...exchange, response: result.data, error: undefined } : exchange,
        ),
      ),
    onError: (error, variables) =>
      setExchanges((previous) =>
        previous.map((exchange) =>
          exchange.id === variables.id
            ? {
                ...exchange,
                error:
                  error instanceof ApiError && error.code === 'AI_NOT_CONFIGURED'
                    ? 'Trợ lý chưa sẵn sàng. Bạn thử lại sau nhé.'
                    : errorText(error),
              }
            : exchange,
        ),
      ),
    onSettled: () => {
      sending.current = false;
    },
  });
  useEffect(() => {
    if (open && !hidden) input.current?.focus({ preventScroll: true });
  }, [open, hidden]);
  useEffect(() => {
    if (open && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [open, exchanges, chat.isPending]);
  const close = () => {
    setOpen(false);
    launcher.current?.focus({ preventScroll: true });
  };
  const submit = () => {
    const prompt = draft.trim();
    if (sending.current || prompt.length < 2) return;
    sending.current = true;
    const exchange = { id: ++nextId.current, prompt, servings };
    const history = assistantHistory(exchanges);
    setExchanges((previous) => [...previous, exchange]);
    setDraft('');
    chat.mutate({ ...exchange, history });
  };
  const retry = (exchange: AssistantExchange) => {
    if (sending.current) return;
    sending.current = true;
    setExchanges((previous) =>
      previous.map((item) => (item.id === exchange.id ? { ...item, error: undefined } : item)),
    );
    chat.mutate({
      id: exchange.id,
      prompt: exchange.prompt,
      servings: exchange.servings,
      history: assistantHistory(exchanges.filter((item) => item.id < exchange.id)),
    });
  };
  const choosePrompt = (prompt: string) => {
    setDraft(prompt);
    input.current?.focus({ preventScroll: true });
  };
  return (
    <div className="cooking-assistant" hidden={hidden}>
      {open && (
        <section
          className="cooking-chat-panel"
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              close();
            }
          }}
        >
          <header className="cooking-chat-header">
            <img src="/images/matcher-bear-chef.webp" alt="" />
            <div>
              <h2 id={titleId}>Trợ lý bếp Cookora</h2>
              <p>Cùng bạn nghĩ món, cùng bạn vào bếp</p>
            </div>
            <button
              type="button"
              className="cooking-chat-icon"
              onClick={close}
              aria-label="Thu gọn trợ lý AI"
            >
              <Minus size={20} />
            </button>
          </header>
          <div
            className="cooking-chat-log"
            role="log"
            aria-label="Cuộc trò chuyện với trợ lý"
            aria-live="polite"
            aria-relevant="additions text"
            ref={log}
          >
            <div className="cooking-chat-welcome">
              <span>
                <ChefHat size={20} />
              </span>
              <p>
                Chào bạn, mình là trợ lý bếp Cookora! Bạn đang có nguyên liệu gì? Mình sẽ ưu tiên món trong
                kho và gợi ý thêm món mới phù hợp.
              </p>
              <small>Bạn có thể hỏi tiếp về cách nấu hoặc điều chỉnh món ăn.</small>
            </div>
            <div className="cooking-chat-shortcuts" aria-label="Gợi ý trò chuyện">
              <button type="button" onClick={() => choosePrompt('Mình đang có các nguyên liệu: ')}>
                <Leaf size={18} /> Gợi ý món từ nguyên liệu
              </button>
              <button type="button" onClick={() => choosePrompt('Gợi ý thực đơn tuần cân bằng, dễ nấu cho mình.')}>
                <Calendar size={18} /> Lên thực đơn tuần
              </button>
              <button type="button" onClick={() => choosePrompt('Gợi ý món Eat Fit lành mạnh và cân bằng dinh dưỡng.')}>
                <Dumbbell size={18} /> Món Eat Fit
              </button>
              <button type="button" onClick={() => choosePrompt('Chia sẻ cho mình vài mẹo vào bếp hữu ích.')}>
                <Lightbulb size={18} /> Mẹo vào bếp
              </button>
            </div>
            {exchanges.map((exchange) => (
              <div className="cooking-chat-exchange" key={exchange.id}>
                <div className="cooking-chat-user">
                  <p>{exchange.prompt}</p>
                  <small>{exchange.servings} người</small>
                </div>
                {exchange.response && (
                  <div className="cooking-chat-reply">
                    <span className="cooking-chat-author">
                      <Sparkles size={14} />
                      Cookora
                    </span>
                    <p>{exchange.response.menuOverview}</p>
                    {!!exchange.response.catalogDishes?.length && (
                      <div className="cooking-chat-recipes">
                        <h3>Ưu tiên trong kho Cookora</h3>
                        {exchange.response.catalogDishes.map(({ recipe, reason }) => (
                          <Link key={recipe.id} to={`/cong-thuc/${recipe.slug}`} onClick={close}>
                            <span>
                              <strong>{recipe.title}</strong>
                              <small>{reason}</small>
                              {recipe.contentStatus === 'DRAFT' && <small>Công thức mẫu chưa nấu thử</small>}
                            </span>
                            <ArrowUpRight size={17} />
                          </Link>
                        ))}
                      </div>
                    )}
                    {!!exchange.response.dishes.length && (
                      <div className="cooking-chat-recipes is-generated">
                        <h3>Ý tưởng thêm từ AI</h3>
                        {exchange.response.dishes.map((dish) => (
                          <button type="button" key={dish.id} onClick={() => setDetail(dish)}>
                            <span>
                              <strong>{dish.title}</strong>
                              <small>
                                {dish.totalMinutes} phút · {dish.servings} người
                              </small>
                            </span>
                            <ArrowUpRight size={17} />
                          </button>
                        ))}
                        <small className="cooking-chat-disclaimer">
                          Món AI tạo chưa được Cookora biên tập hoặc nấu thử.
                        </small>
                      </div>
                    )}
                  </div>
                )}
                {exchange.error && (
                  <div className="cooking-chat-error" role="alert">
                    <p>{exchange.error}</p>
                    <button type="button" disabled={chat.isPending} onClick={() => retry(exchange)}>
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            ))}
            {chat.isPending && (
              <p className="cooking-chat-pending" role="status">
                <LoaderCircle size={16} className="spin" />
                Cookora đang chuẩn bị câu trả lời…
              </p>
            )}
          </div>
          <form
            className="cooking-chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="cooking-chat-composer-top">
              <label htmlFor={servingsId}>Khẩu phần</label>
              <select
                id={servingsId}
                value={servings}
                disabled={chat.isPending}
                onChange={(event) => setServings(Number(event.target.value))}
              >
                {Array.from({ length: 20 }, (_, index) => (
                  <option value={index + 1} key={index}>
                    {index + 1} người
                  </option>
                ))}
              </select>
              <small>{draft.length}/1000</small>
            </div>
            <label className="cooking-chat-sr-only" htmlFor={inputId}>
              Nhắn cho trợ lý bếp Cookora
            </label>
            <div className="cooking-chat-input-row">
              <textarea
                ref={input}
                id={inputId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập nguyên liệu hoặc hỏi mình về món ăn…"
                rows={1}
                maxLength={1000}
                minLength={2}
                required
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    submit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={chat.isPending || draft.trim().length < 2}
                aria-label="Gửi tin nhắn"
              >
                <Send size={19} />
              </button>
            </div>
            <p className="cooking-chat-sr-only">Enter để gửi · Shift + Enter để xuống dòng</p>
          </form>
        </section>
      )}
      <button
        ref={launcher}
        type="button"
        className={`cooking-chat-launcher${open ? ' is-open' : ''}`}
        tabIndex={open ? -1 : 0}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? 'Thu gọn trợ lý AI Cookora' : 'Mở trợ lý AI Cookora'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
      >
        {open ? (
          <X size={24} />
        ) : (
          <>
            <img src="/images/matcher-bear-chef.webp" alt="" />
            <MessageCircle className="cooking-chat-launcher-badge" size={19} />
          </>
        )}
      </button>
      {detail && !hidden && <AiDishDialog dish={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
