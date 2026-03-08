"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addItems } from "@/features/items/itemsSlice";
import { ShoppingItem } from "@/types";

export function TextInput() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [recognitionError, setRecognitionError] = useState<string | null>(null);
	const dispatch = useAppDispatch();
	const recognitionRef = useRef<any>(null);

	// Initialize speech recognition
	useEffect(() => {
		if (typeof window !== "undefined") {
			const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

			if (SpeechRecognition) {
				const recognition = new SpeechRecognition();
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.lang = "en-US";

				recognition.onstart = () => {
					setIsListening(true);
					setRecognitionError(null);
				};

				recognition.onresult = (event: any) => {
					let finalTranscript = "";
					let interimTranscript = "";

					for (let i = event.resultIndex; i < event.results.length; i++) {
						const transcript = event.results[i][0].transcript;
						if (event.results[i].isFinal) {
							finalTranscript += transcript + " ";
						} else {
							interimTranscript += transcript;
						}
					}

					if (finalTranscript) {
						// Filter the content before adding to input
						const filterResult = filterInappropriateContent(finalTranscript);

						if (filterResult.isAppropriate) {
							setInput((prev) => prev + finalTranscript);
						} else {
							// Show warning for filtered content
							setRecognitionError(filterResult.reason || "Inappropriate content filtered");
							// Still add filtered version if it exists
							if (filterResult.filteredText.trim()) {
								setInput((prev) => prev + filterResult.filteredText + " ");
							}
						}
					}
				};

				recognition.onerror = (event: any) => {
					console.error("Speech recognition error:", event.error);
					setRecognitionError(`Speech recognition error: ${event.error}`);
					setIsListening(false);
					setIsRecording(false);
				};

				recognition.onend = () => {
					setIsListening(false);
					setIsRecording(false);
				};

				recognitionRef.current = recognition;
			}
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	const startRecording = () => {
		if (recognitionRef.current) {
			recognitionRef.current.start();
			setIsRecording(true);
		} else {
			setRecognitionError("Speech recognition is not supported in your browser");
		}
	};

	const stopRecording = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setIsRecording(false);
		}
	};

	// Content filtering function
	const filterInappropriateContent = (
		text: string,
	): { isAppropriate: boolean; filteredText: string; reason?: string } => {
		// List of inappropriate/harmful words and phrases to filter
		const inappropriatePatterns = [
			// Profanity and offensive language (basic examples)
			/\b(bad|inappropriate|harmful|dangerous|illegal|drugs|weapons|explosives|poison|toxic)\b/gi,
			// Medical terms that shouldn't be in shopping lists
			/\b(medicine|pills|tablets|prescription|drugs|overdose|suicide|kill|harm)\b/gi,
			// Violence and harmful content
			/\b(kill|hurt|attack|weapon|gun|knife|bomb|explosive|violence)\b/gi,
			// Adult content
			/\b(adult|xxx|porn|sexual|inappropriate)\b/gi,
			// Scam/fraud related
			/\b(scam|fraud|fake|counterfeit|illegal|stolen)\b/gi,
		];

		const lowerText = text.toLowerCase();

		for (const pattern of inappropriatePatterns) {
			if (pattern.test(lowerText)) {
				// Remove the inappropriate content
				const filteredText = text.replace(pattern, "[FILTERED]");
				return {
					isAppropriate: false,
					filteredText,
					reason: "Inappropriate content detected and filtered",
				};
			}
		}

		// Additional check for very short or nonsensical inputs
		const words = text.trim().split(/\s+/);
		if (words.length === 1 && words[0].length < 2) {
			return {
				isAppropriate: false,
				filteredText: "",
				reason: "Input too short or unclear",
			};
		}

		return {
			isAppropriate: true,
			filteredText: text,
		};
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;

		// Only filter when user stops typing (debounced approach)
		// For now, just allow typing and filter on submit/voice input
		setInput(newValue);
	};

	const parseItems = async (text: string): Promise<ShoppingItem[]> => {
		try {
			const res = await fetch("/api/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ input: text }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to parse items");
			}

			const data = await res.json();
			console.log("data", data);

			// Handle warning from API if content was filtered
			if (data.warning) {
				setRecognitionError(data.warning);
			}

			return data.items || [];
		} catch (error) {
			console.error(error);
			setRecognitionError("Failed to parse items");
			return [];
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		setIsLoading(true);
		setError(null);
		setRecognitionError(null);

		try {
			// Filter content before parsing
			const filterResult = filterInappropriateContent(input);

			if (!filterResult.isAppropriate) {
				// Show warning but still process filtered content if it exists
				if (filterResult.reason) {
					setRecognitionError(filterResult.reason);
				}

				// If everything was filtered out, don't proceed
				if (!filterResult.filteredText.trim()) {
					setError("Input contains only inappropriate content. Please try again.");
					return;
				}

				// Update input to show filtered version
				setInput(filterResult.filteredText);
			}

			const textToParse = filterResult.filteredText;
			const parsedItems = await parseItems(textToParse);

			if (parsedItems.length > 0) {
				dispatch(addItems(parsedItems));
				setInput("");
			} else {
				setError("No items could be parsed. Try a different format.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to parse items");
		} finally {
			setIsLoading(false);
		}
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
			<div className="relative">
				<div className="relative">
					<textarea
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder="Enter items like: 2 litres milk, 5kg rice, baby diapers 40 pieces or click the microphone to use voice input"
						className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
						rows={4}
						disabled={isLoading || isRecording}
					/>

					{/* Voice Recording Button */}
					<button
						type="button"
						onClick={isRecording ? stopRecording : startRecording}
						disabled={isLoading}
						className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-200 ${
							isRecording
								? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
								: isListening
									? "bg-blue-500 hover:bg-blue-600 text-white"
									: "bg-gray-200 hover:bg-gray-300 text-gray-600"
						} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
						title={isRecording ? "Stop recording" : "Start voice recording"}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{isRecording ? (
								// Stop icon
								<rect
									x="6"
									y="6"
									width="12"
									height="12"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							) : (
								// Microphone icon
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
								/>
							)}
						</svg>
					</button>
				</div>

				{/* Voice Status Indicator */}
				{(isListening || isRecording) && (
					<div className="mt-2 flex items-center space-x-2 text-sm">
						<div
							className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
						></div>
						<span className={`font-medium ${isRecording ? "text-red-600" : "text-blue-600"}`}>
							{isRecording ? "Recording... Speak now" : "Listening..."}
						</span>
					</div>
				)}

				{error && (
					<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				{recognitionError && (
					<div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
						{recognitionError}
					</div>
				)}

				<div className="flex space-x-3 mt-3">
					<button
						type="submit"
						disabled={isLoading || !input.trim() || isRecording}
						className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Parsing with AI...
							</>
						) : (
							"Add Items"
						)}
					</button>

					{input.trim() && (
						<button
							type="button"
							onClick={() => setInput("")}
							disabled={isLoading || isRecording}
							className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							Clear
						</button>
					)}
				</div>
			</div>
		</form>
	);
}
