import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-medium">Help & Support</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-blue-700"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-4">
              Welcome to LabManagerPro! How can we help you today?
            </p>
            {/* Add your chat messages or support content here */}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" className="shrink-0">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Button
        onClick={toggleChat}
        className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
        size="icon"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};
