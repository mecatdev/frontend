// /**
//  * Marketplace Page - List bisnis untuk discovery
//  *
//  * TODO: Lengkapi render
//  * - Fetch businesses dari API (fetchBusinesses)
//  * - Grid card: logo, name, tagline, industry, Link ke /business/[slug]
//  * - Empty state jika tidak ada bisnis
//  */
// import Link from "next/link";
// import { fetchBusinesses } from "@/lib/api";

// export const dynamic = "force-dynamic";

// export default async function MarketplacePage() {
//   let businesses: Awaited<ReturnType<typeof fetchBusinesses>> = [];
//   try {
//     businesses = await fetchBusinesses();
//   } catch (e) {
//     console.error("Failed to fetch businesses:", e);
//   }

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
//         <p className="mt-2 text-slate-400">
//           Discover businesses and interact with their AI Business Avatars
//         </p>
//       </div>

//       {businesses.length === 0 ? (
//         <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-12 text-center">
//           <p className="text-slate-400">No businesses listed yet.</p>
//           <p className="mt-2 text-sm text-slate-500">
//             Ensure the backend is running and database is seeded.
//           </p>
//         </div>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {businesses.map((b) => (
//             <Link
//               key={b.id}
//               href={`/business/${b.slug}`}
//               className="block rounded-xl border border-slate-700 bg-slate-800/50 p-6 hover:border-slate-600 hover:bg-slate-800/70 transition"
//             >
//               <p className="text-slate-500 text-sm">
//                 TODO: Logo, name, tagline, industry
//               </p>
//               <h2 className="font-semibold truncate">{b.name}</h2>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
