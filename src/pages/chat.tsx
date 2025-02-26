import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatButton from "@/components/ChatButton";
import ChatModal from "@/components/ChatModal";

// Define the structure of the fetched data
interface ChattingDetails {
  chat_id: string;
  senderId: string;
  receiverId: string;
}

const fetchChattingDetails = async ({
  chattingIdFromUrl,
  chattingIdFromStorage,
}: {
  chattingIdFromUrl?: string;
  chattingIdFromStorage?: string | null;
}): Promise<ChattingDetails> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/verify-chatting-id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chattingIdFromUrl, chattingIdFromStorage }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Invalid IDs, redirecting to login...");
  }

  return response.json();
};

const Index: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chattingDetails, setChattingDetails] =
    useState<ChattingDetails | null>(null);
    const [senderId, setSenderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ chattingId: string }>();
  const navigate = useNavigate();

  const chattingIdFromUrl = params.chattingId;
  const chattingIdFromStorage = localStorage.getItem("Chatting_id");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchChattingDetails({
          chattingIdFromUrl,
          chattingIdFromStorage,
        });
        setChattingDetails(data);

        // Update local storage with the fetched chattingId
        localStorage.setItem("Chatting_Verified", data.chat_id);
        setSenderId(data.chat_id);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Invalid IDs, redirecting...");
        navigate("/"); // Redirect to login on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [chattingIdFromUrl, chattingIdFromStorage, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // Display error message if any
  }

  if (!chattingDetails) {
    return <div>Error: No data available</div>; // Handle unexpected cases
  }
  const receiverId = "fa59b2ee-99b1-4d25-bfe3-c9af9f8f533b";


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Connect with Top Freelancers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start a conversation with skilled professionals ready to bring your
            projects to life. Click the chat button to begin.
          </p>
        </div>
      </div>

      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        senderId={senderId}
        receiverId={receiverId}
      />
    </div>
  );
};

export default Index;
