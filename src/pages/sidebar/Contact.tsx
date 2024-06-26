import { useNavigate } from "react-router-dom";
import { Chat, Participant, LastMessage } from "../../types";
import { getUserId } from "../../modules/getUserId";

type Props = {
  onItemClick: (chatId: number) => void;
  chat: Chat;
};

function Contact({ onItemClick, chat }: Props) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onItemClick(chat.id);
  };

  const getUserProfile = (participants: Participant[]) => {
    const currentUserId = getUserId();
    const currentUserIdNumber =
      currentUserId !== undefined ? Number(currentUserId) : undefined;
    return participants.find(
      (participant) => participant.user.id !== currentUserIdNumber
    );
  };

  const renderLastMessage = (
    lastMessage: LastMessage | null
  ): React.ReactNode => {
    return lastMessage ? lastMessage.text : "";
  };

  const profile = getUserProfile(chat.participants);

  return (
    <div
      onClick={() => handleNavigate("/chat")}
      className="flex gap-3 p-2 hover:bg-sky-50 ease-in duration-100 rounded-md cursor-pointer relative">
      <div className="h-[40px] w-[45px] ">
        <img
          src={profile?.user.profile?.profile_pic || "/images/avatar.jpg"}
          alt="profile-pic"
          className="rounded-full h-full w-full min-w-0"
        />
      </div>
      <div className="flex justify-between flex-row w-full">
        <div className="flex flex-col justify-evenly">
          <div className=" font-medium text-sky-900 text-sm">
            {profile?.user.profile?.first_name || profile?.user.phone_number}
          </div>
          <div className="text-xxs text-sky-600">
            {renderLastMessage(chat.lastMessage)}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <span className="h-4 w-4 text-xs flex justify-center items-center rounded-2xl bg-red-200 py-1 text-red-700">
            1
          </span>
          <div className="text-xs text-sky-950">10:20 AM</div>
        </div>
      </div>
      <span className="absolute bottom-0 w-10/12 border-b-2 border-slate-100"></span>
    </div>
  );
}

export default Contact;
