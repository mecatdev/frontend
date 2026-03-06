import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mails = [
  {
    id: 1,
    from: "Budi Santoso",
    subject: "Investment Inquiry – Series A",
    preview: "Hi, I'm interested in discussing a potential Series A investment in your company...",
    date: "Mar 5, 2026",
    read: false,
  },
  {
    id: 2,
    from: "Dewi Rahayu",
    subject: "Partnership Proposal",
    preview: "We'd love to explore a strategic partnership that could benefit both parties...",
    date: "Mar 4, 2026",
    read: false,
  },
  {
    id: 3,
    from: "Ahmad Fauzi",
    subject: "Follow-up: Meeting Last Week",
    preview: "It was great meeting you last week. I wanted to follow up on our conversation...",
    date: "Mar 3, 2026",
    read: true,
  },
  {
    id: 4,
    from: "Siti Nurhaliza",
    subject: "Due Diligence Documents",
    preview: "Please find attached the due diligence checklist we discussed in our last call...",
    date: "Mar 2, 2026",
    read: true,
  },
  {
    id: 5,
    from: "Rizky Pratama",
    subject: "Term Sheet Review",
    preview: "I've reviewed the term sheet and have a few questions before we proceed...",
    date: "Mar 1, 2026",
    read: true,
  },
];

export default function MailPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Messages from investors and partners.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {mails.map((mail) => (
                <li
                  key={mail.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm ${mail.read ? "font-normal text-muted-foreground" : "font-semibold"}`}>
                        {mail.from}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">{mail.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${mail.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                        {mail.subject}
                      </p>
                      {!mail.read && (
                        <Badge className="text-[10px] px-1.5 py-0 shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{mail.preview}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
