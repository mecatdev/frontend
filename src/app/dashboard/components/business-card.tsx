// "use client";

// import { useRouter } from "next/navigation";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import type { MyBusiness, BusinessVerificationStatus } from "@/api/v1/business/route";

// const statusConfig: Record<BusinessVerificationStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
//   DRAFT:    { label: "Draft",        variant: "outline",      color: "text-muted-foreground" },
//   PENDING:  { label: "Under Review", variant: "secondary",    color: "text-yellow-700"       },
//   VERIFIED: { label: "Verified",     variant: "default",      color: "text-green-700"        },
//   REJECTED: { label: "Rejected",     variant: "destructive",  color: "text-red-600"          },
// };

// export function BusinessCard({ business }: { business: MyBusiness }) {
//   const router = useRouter();
//   const status = statusConfig[business.verificationStatus];

//   return (
//     <Card
//       className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20 group"
//       onClick={() => router.push(`/dashboard/business/${business.id}`)}
//     >
//       <CardContent className="pt-5 space-y-4">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-2">
//           <div className="space-y-0.5">
//             <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
//               {business.name}
//             </h3>
//             <p className="text-xs text-muted-foreground">
//               {business.industry ?? "—"}
//               {business.stage ? ` · ${business.stage.replace(/_/g, " ")}` : ""}
//             </p>
//           </div>
//           <Badge variant={status.variant} className="shrink-0 text-xs">{status.label}</Badge>
//         </div>

//         {/* Tagline */}
//         {business.tagline && (
//           <p className="text-sm text-muted-foreground line-clamp-2">{business.tagline}</p>
//         )}

//         {/* Status hint */}
//         <p className={`text-xs font-medium ${status.color}`}>
//           {business.verificationStatus === "DRAFT" && "Belum diverifikasi — klik untuk mulai verifikasi"}
//           {business.verificationStatus === "PENDING" && "Sedang direview — klik untuk lihat progress"}
//           {business.verificationStatus === "VERIFIED" && "Aktif di marketplace — klik untuk lihat perkembangan"}
//           {business.verificationStatus === "REJECTED" && "Verifikasi ditolak — klik untuk submit ulang"}
//         </p>

//         {/* Action buttons */}
//         <div className="flex gap-2 flex-wrap pt-1" onClick={(e) => e.stopPropagation()}>
//           <Button
//             size="sm"
//             variant="outline"
//             className="text-xs h-8"
//             onClick={() => router.push(`/dashboard/ai-configuration?businessId=${business.id}`)}
//           >
//             AI Knowledge
//           </Button>

//           {business.verificationStatus === "VERIFIED" && (
//             <Button
//               size="sm"
//               variant="outline"
//               className="text-xs h-8"
//               onClick={() => router.push(`/business/${business.slug}`)}
//             >
//               Lihat Publik
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
