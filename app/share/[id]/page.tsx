"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setItems } from "@/features/items/itemsSlice";
import { ShoppingItem } from "@/types";
import { TextInput } from "@/components/TextInput";
import { ItemList } from "@/components/ItemList";
import { useParams } from "next/navigation";

// Shopping list content component
function SharedListContent() {
	const dispatch = useAppDispatch();
	const items = useAppSelector((state) => state.items.items);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const params = useParams();
	const shareId = params.id as string;

	// Load shared list from database
	useEffect(() => {
		const loadSharedList = async () => {
			if (!shareId) {
				setError("Invalid share link");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`/api/share?id=${shareId}`);

				if (response.status === 410) {
					setError("This shared list has expired (1-week limit). Please create a new list.");
					setIsLoading(false);
					return;
				}

				if (!response.ok) {
					throw new Error("Shared list not found");
				}

				const data = await response.json();
				dispatch(setItems(data.items || []));

				// Show warning if expiring soon
				if (data.isExpiringSoon) {
					console.warn(`List expires in ${data.hoursRemaining.toFixed(1)} hours`);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load shared list");
			} finally {
				setIsLoading(false);
			}
		};

		loadSharedList();
	}, [shareId, dispatch]);

	// Save changes to database whenever items change
	useEffect(() => {
		if (!isLoading && shareId && items.length >= 0) {
			const saveToDatabase = async () => {
				try {
					await fetch("/api/share", {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ shareId, items }),
					});
				} catch (error) {
					console.error("Error saving to database:", error);
				}
			};

			// Debounce save to avoid too frequent updates
			const timeoutId = setTimeout(saveToDatabase, 1000);
			return () => clearTimeout(timeoutId);
		}
	}, [items, shareId, isLoading]);

	const handleShare = () => {
		const shareUrl = `${window.location.origin}${window.location.pathname}`;

		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				alert("Share link copied to clipboard!");
			})
			.catch(() => {
				prompt("Share this link:", shareUrl);
			});
	};

	const handleClearAll = () => {
		if (window.confirm("Are you sure you want to clear all items? This will update for everyone with this link.")) {
			dispatch(setItems([]));
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
				<div className="w-full max-w-3xl">
					<div className="mb-8 text-center">
						<div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
							<svg
								className="w-4 h-4 mr-2 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							<span>Loading shared list…</span>
						</div>
						<h1 className="text-2xl font-semibold text-gray-900">Fetching your shared shopping list</h1>
						<p className="mt-2 text-sm text-gray-600">
							We&apos;re syncing the latest items so everyone sees the same list.
						</p>
					</div>

					{/* Skeleton layout to mirror shared list screen */}
					<div className="space-y-6 animate-pulse">
						<div className="h-24 rounded-2xl bg-white shadow-sm border border-gray-100" />
						<div className="space-y-3">
							<div className="h-4 w-52 rounded-full bg-gray-200" />
							<div className="space-y-2">
								<div className="h-16 rounded-xl bg-white shadow-sm border border-gray-100" />
								<div className="h-16 rounded-xl bg-white shadow-sm border border-gray-100" />
								<div className="h-16 rounded-xl bg-white shadow-sm border border-gray-100" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-600 text-lg mb-4">{error}</div>
					<a href="/" className="text-blue-600 hover:text-blue-700 underline">
						Create a new list
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Shopping List</h1>
					<p className="text-gray-600 mb-4">Anyone with this link can view and edit this list</p>

					{/* Data Expiration Notice */}
					<div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
						<svg
							className="w-4 h-4 mr-2 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Data automatically removed after 1 week for privacy</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center space-x-4 mb-6">
					<button
						onClick={handleShare}
						className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
						Copy Share Link
					</button>
					<button
						onClick={handleClearAll}
						className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						Clear All
					</button>
					<a
						href="/"
						className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-block"
					>
						Create New List
					</a>
				</div>

				{/* Input Section */}
				<div className="mb-8">
					<TextInput />
				</div>

				{/* Items List */}
				<div className="mb-8">
					<ItemList />
				</div>

				{/* Footer */}
				<div className="text-center text-sm text-gray-500 mt-12">
					<p>Changes are saved automatically and synced with everyone</p>
					<p className="mt-1">Share this link to collaborate with others</p>
				</div>
			</div>
		</div>
	);
}

export default function SharedListPage() {
	return (
		<Provider store={store}>
			<SharedListContent />
		</Provider>
	);
}
