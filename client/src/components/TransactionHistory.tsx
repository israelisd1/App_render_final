import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  'pt-BR': {
    title: "Histórico de Pagamentos",
    description: "Visualize todas as suas transações e faturas",
    noInvoices: "Nenhuma fatura encontrada",
    noInvoicesDesc: "Quando você fizer uma assinatura, suas faturas aparecerão aqui.",
    loading: "Carregando histórico...",
    date: "Data",
    descriptionCol: "Descrição",
    amount: "Valor",
    status: "Status",
    actions: "Ações",
    viewInvoice: "Ver Fatura",
    downloadPdf: "Baixar PDF",
    paid: "Pago",
    open: "Aberto",
    draft: "Rascunho",
    uncollectible: "Não cobrável",
    void: "Cancelado",
  },
  'en-US': {
    title: "Payment History",
    description: "View all your transactions and invoices",
    noInvoices: "No invoices found",
    noInvoicesDesc: "When you subscribe to a plan, your invoices will appear here.",
    loading: "Loading history...",
    date: "Date",
    descriptionCol: "Description",
    amount: "Amount",
    status: "Status",
    actions: "Actions",
    viewInvoice: "View Invoice",
    downloadPdf: "Download PDF",
    paid: "Paid",
    open: "Open",
    draft: "Draft",
    uncollectible: "Uncollectible",
    void: "Void",
  },
};

const statusColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  paid: "default",
  open: "secondary",
  draft: "outline",
  uncollectible: "destructive",
  void: "outline",
};

export default function TransactionHistory() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations['pt-BR'];

  // @ts-ignore - Tipo será atualizado após recompilação
  const { data: invoices, isLoading } = trpc.subscription.invoices.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">{t.noInvoices}</h3>
            <p className="text-sm text-muted-foreground">{t.noInvoicesDesc}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: t.paid,
      open: t.open,
      draft: t.draft,
      uncollectible: t.uncollectible,
      void: t.void,
    };
    return statusMap[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">{t.date}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{t.descriptionCol}</th>
                <th className="text-right py-3 px-4 font-medium text-sm">{t.amount}</th>
                <th className="text-center py-3 px-4 font-medium text-sm">{t.status}</th>
                <th className="text-right py-3 px-4 font-medium text-sm">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">
                    {formatDate(invoice.paidAt || invoice.created)}
                  </td>
                  <td className="py-3 px-4 text-sm">{invoice.description}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    {formatAmount(invoice.amount, invoice.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={statusColors[invoice.status] || "default"}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t.viewInvoice}
                          </a>
                        </Button>
                      )}
                      {invoice.invoicePdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
