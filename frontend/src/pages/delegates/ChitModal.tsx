import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { formatMessageTime } from "../../lib/utils";
import { SendIcon, XIcon } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { useReplyMessage } from "../../hooks/useReplyMessage";
import { toast } from "sonner";
import useListenMessages from "../../hooks/useListenMessages";
import { Textarea } from "../../components/ui/textarea";

const ChitModal = ({
  messages,
}: {
  messages: any;
  onUpdate?: (message: any) => void;
}) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const { loading, replyMessage } = useReplyMessage();
  useListenMessages();
  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return toast.error("Message cannot be empty");
    replyMessage(message, messages[0].conversationId);
    setMessage(""); // Clear input field after sending
  };
  const handleClose = () => {
    navigate("/");
  };
  return (
    <div className="flex flex-col gap-2 w-full divided-y-2  ">
      <div className="p-6 relative mb-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Chit</h2>
          <div className="flex items-center gap-4">
            {messages[0]?.isViaEB && (
              <div className="py-2 px-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                Via EB
              </div>
            )}

            <Button
              onClick={handleClose}
              className="size-8"
              variant={"outline"}
              size={"icon"}
            >
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>
        {messages.map((message: any, index: number) => (
          <div
            key={index}
            className="flex flex-col justify-start mb-2 pb-2 border-b-2 border-b-muted"
          >
            {/* Message Header -> Sender Details */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full size-12 bg-slate-200 dark:bg-slate-800 text-primary font-bold flex items-center justify-center text-lg">
                  {message?.sender?.portfolio?.charAt(0)}
                </div>
                <p className="font-semibold text-lg">
                  {message?.sender?.portfolio}
                </p>
              </div>
              <div className="text-muted-foreground text-sm">
                {formatMessageTime(message?.createdAt)}
              </div>
            </div>
            {/* Message Body */}
            <div className="mt-1">
              <p className="text-lg">{message?.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 border-t-2 border-muted w-full md:w-5/6 p-5 z-50 bg-background shadow-lg">
        <form onSubmit={handleReply}>
          <div className="flex items-center justify-between">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              name="message"
              placeholder="Type a message..."
              className="p-5 w-[90%] text-lg rounded-lg border border-primary max-h-36"
            />
            <Button
              disabled={loading}
              className=" py-5  rounded-tl-0 rounded-bl-0 rounded-tr-lg rounded-br-lg  flex items-center gap-2"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Reply <SendIcon className="size-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChitModal;
