import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.forgotPasswordError"));
        return;
      }

      setEmailSent(true);
      toast.success(t("auth.forgotPasswordSuccess"));
    } catch (error) {
      toast.error(t("auth.forgotPasswordError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Logo e Título */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            Arqrender
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t("auth.forgotPasswordTitle")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("auth.forgotPasswordDescription")}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? t("auth.loading") : t("auth.sendResetLink")}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-700">{t("auth.resetEmailSent")}</p>
            <p className="text-sm text-gray-500">{t("auth.checkInbox")}</p>
          </div>
        )}

        {/* Link para voltar ao Login */}
        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-orange-600 hover:underline"
          >
            ← {t("auth.backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}

