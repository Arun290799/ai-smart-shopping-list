"use client";

import { useEffect, useState, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setItems } from "@/features/items/itemsSlice";
import { ShoppingItem } from "@/types";
import { TextInput } from "@/components/TextInput";
import { ItemList } from "@/components/ItemList";

// localStorage and MongoDB sharing logic
function ShoppingListContent() {
	const dispatch = useAppDispatch();
	const items = useAppSelector((state) => state.items.items);
	const [isLoading, setIsLoading] = useState(true);
	const [currentShareId, setCurrentShareId] = useState<string | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Load share ID from localStorage on mount
	useEffect(() => {
		const loadOrCreateShareId = async () => {
			try {
				let savedShareId = localStorage.getItem("currentShareId");

				if (!savedShareId) {
					// Create a new share ID and empty list in database
					const response = await fetch("/api/share", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ items: [] }),
					});

					if (response.ok) {
						const data = await response.json();
						savedShareId = data.shareId;
						setCurrentShareId(savedShareId);
						localStorage.setItem("currentShareId", savedShareId!);
					} else {
						throw new Error("Failed to create share ID");
					}
				} else {
					setCurrentShareId(savedShareId);
				}

				// Load the list from database using the share ID
				const listResponse = await fetch(`/api/share?id=${savedShareId}`);

				if (listResponse.status === 410) {
					// List expired, create new one
					console.log("List expired, creating new one...");
					localStorage.removeItem("currentShareId");

					// Create new share ID
					const createResponse = await fetch("/api/share", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ items: [] }),
					});

					if (createResponse.ok) {
						const data = await createResponse.json();
						const newShareId = data.shareId;
						setCurrentShareId(newShareId);
						localStorage.setItem("currentShareId", newShareId);
						dispatch(setItems([]));
					}
				} else if (listResponse.ok) {
					const data = await listResponse.json();
					dispatch(setItems(data.items || []));

					// Show warning if expiring soon
					if (data.isExpiringSoon) {
						console.warn(`List expires in ${data.hoursRemaining.toFixed(1)} hours`);
					}
				} else {
					console.error("Failed to load list from database");
				}
			} catch (error) {
				console.error("Error setting up share ID:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadOrCreateShareId();
	}, [dispatch]);

	// Save changes to database (all lists now have share ID)
	useEffect(() => {
		if (!isLoading && currentShareId && items.length >= 0) {
			// Clear previous timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			const saveToDatabase = async () => {
				try {
					await fetch("/api/share", {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ shareId: currentShareId, items }),
					});
				} catch (error) {
					console.error("Error saving to database:", error);
				}
			};

			// Debounce save to avoid too frequent updates
			timeoutRef.current = setTimeout(saveToDatabase, 1000);
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}
	}, [items, currentShareId, isLoading]);

	const handleShare = async () => {
		try {
			if (!currentShareId) {
				throw new Error("No share ID available");
			}

			const shareUrl = `${window.location.origin}/share/${currentShareId}`;

			navigator.clipboard
				.writeText(shareUrl)
				.then(() => {
					alert("Share link copied to clipboard!");
				})
				.catch(() => {
					prompt("Share this link:", shareUrl);
				});
		} catch (error) {
			console.error("Error creating share link:", error);
			alert("Error creating share link");
		}
	};

	const handleClearAll = () => {
		if (window.confirm("Are you sure you want to clear all items?")) {
			dispatch(setItems([]));
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
				<div className="w-full max-w-3xl">
					<div className="mb-8 text-center">
						<div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
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
							<span>Setting up your smart list…</span>
						</div>
						<h1 className="text-2xl font-semibold text-gray-900">Loading your shopping list</h1>
						<p className="mt-2 text-sm text-gray-600">
							We&apos;re preparing your shared list and syncing it securely.
						</p>
					</div>

					{/* Skeleton layout to match main screen */}
					<div className="space-y-6 animate-pulse">
						<div className="h-24 rounded-2xl bg-white shadow-sm border border-gray-100" />
						<div className="space-y-3">
							<div className="h-4 w-40 rounded-full bg-gray-200" />
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

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping List</h1>
					<p className="text-gray-600">Add items using natural language</p>
				</div>

				{/* Action Buttons */}
				{items.length > 0 && (
					<div className="flex justify-center space-x-4 mb-6">
						<button
							onClick={handleShare}
							className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						>
							Share List
						</button>
						<button
							onClick={handleClearAll}
							className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
						>
							Clear All
						</button>
					</div>
				)}

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
					<p className="font-medium text-gray-600">Tips</p>
					<p className="mt-1">
						Type or speak your items in natural language, then{" "}
						<span className="font-medium text-gray-700">share your list</span> with one click.
					</p>
				</div>
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<Provider store={store}>
			<ShoppingListContent />
		</Provider>
	);
}
