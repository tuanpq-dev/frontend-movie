import { memo, useState } from "react";

const CommentForm = ({
    handleSubmit,
    submitLabel,
    hasCancelButton = true,
    initialText = "",
    handleCancel,
    isSubmitting = false,
    className = "",
}) => {
    const [text, setText] = useState(initialText);
    const isTextareaDisabled = text.trim().length === 0;

    const onSubmit = async (event) => {
        event.preventDefault();
        if (isTextareaDisabled || isSubmitting) return;

        const submitted = await handleSubmit(text.trim());
        if (submitted !== false) {
            setText("");
        }
    };

    return (
        <form onSubmit={onSubmit} className={`mt-2 ${className}`}>
            <textarea
                value={text}
                className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-[#171c28] p-3 text-sm text-white outline-none transition-colors placeholder:text-gray-400 focus:border-[#ffb700] focus:ring-2 focus:ring-[#ffb700]/20 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Nhập bình luận"
                onChange={(event) => setText(event.target.value)}
                disabled={isSubmitting}
            />
            <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                    type="submit"
                    className="flex min-h-9 min-w-[96px] cursor-pointer items-center justify-center rounded-full bg-[#ffb700] px-4 text-sm font-semibold text-[#171c28] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isTextareaDisabled || isSubmitting}
                >
                    {isSubmitting ? "Đang gửi..." : submitLabel}
                </button>
                {hasCancelButton && (
                    <button
                        type="button"
                        className="flex min-h-9 min-w-[76px] items-center justify-center rounded-full bg-white/10 px-3 text-sm text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
};

export default memo(CommentForm);
