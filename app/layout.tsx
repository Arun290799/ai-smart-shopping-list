import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "Shopping List - Smart Grocery & Multi-Category List",
		template: "%s | Shopping List",
	},
	description:
		"Create smart shopping lists with natural language input. Auto-categorize items, share with others, and never forget anything again.",
	keywords: [
		"shopping list",
		"grocery list",
		"smart list",
		"natural language",
		"auto categorize",
		"share list",
		"grocery shopping",
		"meal planning",
		"shopping organizer",
	],
	authors: [{ name: "Shopping List App" }],
	creator: "Shopping List App",
	publisher: "Shopping List App",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
	alternates: {
		canonical: "/",
		languages: {
			en: "/en",
			es: "/es",
			fr: "/fr",
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
		title: "Shopping List - Smart Grocery & Multi-Category List",
		description:
			"Create smart shopping lists with natural language input. Auto-categorize items and share with others.",
		siteName: "Shopping List",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Shopping List App - Smart Grocery Lists",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Shopping List - Smart Grocery & Multi-Category List",
		description:
			"Create smart shopping lists with natural language input. Auto-categorize items and share with others.",
		images: ["/twitter-image.jpg"],
		creator: "@shoppinglistapp",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "koZPZMIKXDUY8Cu5pQpgjfLLFaeljTy-LFb6q5h5LPw",
	},
	other: {
		"theme-color": "#3B82F6",
		"msapplication-TileColor": "#3B82F6",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "Shopping List",
		"application-name": "Shopping List",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/icon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/site.webmanifest" />

				{/* Preconnect to external domains for performance */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

				{/* Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Shopping List",
							description:
								"Create smart shopping lists with natural language input. Auto-categorize items and share with others.",
							url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
							applicationCategory: "Productivity",
							operatingSystem: "Web",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							author: {
								"@type": "Organization",
								name: "Shopping List App",
							},
							featureList: [
								"Natural language input",
								"Automatic item categorization",
								"Share lists with others",
								"Multi-device synchronization",
								"Voice input support",
							],
						}),
					}}
				/>
			</head>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
