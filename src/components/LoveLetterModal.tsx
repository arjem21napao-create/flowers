import { useState } from 'react';
import { X, Heart, Edit3, Check, Copy } from 'lucide-react';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
}

export function LoveLetterModal({ isOpen, onClose, recipientName = 'Crish' }: LoveLetterModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(
    `Dearest ${recipientName},\n\nEvery petal of this purple rose was grown to remind you how rare, precious, and cherished you are to me.\n\nJust as this bloom never withers, my care and love for you remain forever constant—radiant through the quiet nights and shining bright in every dawn.\n\nThank you for opening my heart today and every day. You make this world infinitely softer, warmer, and more beautiful.\n\nAlways and forever yours, 💜`
  );

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#b44dff]/40 bg-[#120524]/95 p-6 md:p-8 shadow-[0_0_50px_rgba(180,77,255,0.4)] text-[#f1dcff] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#d8b4fe]/70 hover:text-white hover:bg-[#b44dff]/20 transition-colors"
          title="Close letter"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center gap-1 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#b44dff]/20 border border-[#b44dff]/50 flex items-center justify-center shadow-[0_0_15px_#b44dff]">
            <Heart className="w-6 h-6 text-[#d9a0ff] fill-[#b44dff]" />
          </div>
          <span className="font-script text-2xl text-[#d9a0ff] tracking-wide mt-1">
            A Letter for {recipientName}
          </span>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#b44dff] to-transparent my-1" />
        </div>

        {/* Letter Body */}
        {isEditing ? (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full bg-[#1c0836] border border-[#b44dff]/40 rounded-xl p-4 text-[#f1dcff] font-cormorant text-lg md:text-xl leading-relaxed focus:outline-none focus:border-[#d9a0ff] resize-none"
            placeholder="Write your heartfelt words here..."
          />
        ) : (
          <div className="bg-[#18062d]/70 border border-[#b44dff]/20 rounded-xl p-5 md:p-6 shadow-inner">
            <p className="font-cormorant text-lg md:text-xl text-[#f5e6ff] leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-[#b44dff]/20 text-xs md:text-sm">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#b44dff]/30 hover:bg-[#b44dff]/20 text-[#d8b4fe] transition-all"
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Personalize Note</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#b44dff]/30 hover:bg-[#b44dff]/20 text-[#d8b4fe] transition-all"
              title="Copy message text"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied 💜' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#b44dff] hover:bg-[#9b30ff] text-white font-medium shadow-[0_0_12px_#b44dff] transition-all"
            >
              Keep Close 💜
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
