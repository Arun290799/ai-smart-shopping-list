import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET() {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

		// Basic pages
		const sitemap = [
			{
				url: baseUrl,
				lastModified: new Date(),
				changeFrequency: "daily" as const,
				priority: 1,
			},
			{
				url: `${baseUrl}/share`,
				lastModified: new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.8,
			},
		];

		// Add shared lists if database is available
		try {
			const client: MongoClient = await clientPromise;
			const db = client.db();
			const collections = await db.listCollections().toArray();

			// Check if shares collection exists and has recent entries
			if (collections.some((c: any) => c.name === "shares")) {
				const sharesCollection = db.collection("shares");
				const recentShares = await sharesCollection
					.find({
						createdAt: {
							$gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
						},
					})
					.project({ shareId: 1, updatedAt: 1 })
					.limit(1000) // Limit to prevent sitemap from being too large
					.toArray();

				// Add shared lists to sitemap
				recentShares.forEach((share: any) => {
					sitemap.push({
						url: `${baseUrl}/share/${share.shareId}`,
						lastModified: share.updatedAt || new Date(),
						changeFrequency: "daily" as const,
						priority: 0.6,
					});
				});
			}
		} catch (dbError) {
			// If database connection fails, continue with basic sitemap
			console.warn("Could not connect to database for sitemap generation:", dbError);
		}

		// Generate XML sitemap
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
	.map(
		(page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>`;

		return new NextResponse(xml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Error generating sitemap:", error);
		const fallbackBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

		// Return basic sitemap on error
		const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${fallbackBaseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
</urlset>`;

		return new NextResponse(fallbackXml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml",
			},
		});
	}
}
