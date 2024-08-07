import { useEffect, useState } from "react";
import { getUser, getUserId } from "../../modules/getUserId";
import { BsArrowsFullscreen } from "react-icons/bs";

import {
  ReadStatus,
  RoleCountList,
  RoleList,
  User,
  alertType,
} from "../../types";
import ContactList from "./ContactList";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import UserProfileEdit from "./UserProfileEdit";
// import useCustomAxios from "../../modules/customAxios";
import UserChats from "./UserChats";

type Props = {
  onItemClick: (chatId: number) => void;
  chatsData: RoleList;
  notificationAlert: (alert: alertType) => void;
  handleLoading: (statu: boolean) => void;
  createChat: (user: User) => void;
  fullScreenMode: boolean;
  handleFullscreen: () => void;
};

function Index({
  onItemClick,
  chatsData,
  notificationAlert,
  handleLoading,
  createChat,
  fullScreenMode,
  handleFullscreen,
}: Props) {
  const [userProf, setUserProf] = useState<User | null>(getUser());
  const [contactOpen, setContactOpen] = useState<boolean>(true);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [viewUser, setViewUsers] = useState<boolean>(false);
  const [conversations, setConversations] = useState<RoleCountList>(
    getCountData()
  );

  const openProfile = () => {
    const user = getUser();
    if (user) {
      setUserProf(user);
      setContactOpen(false);
      setProfileOpen(true);
      setEditOpen(false);
      setViewUsers(false);
    }
  };
  const closeAllSlides = () => {
    setContactOpen(true);
    setProfileOpen(false);
    setEditOpen(false);
    setViewUsers(false);
  };

  const openEditForm = () => {
    setEditOpen(true);
    setProfileOpen(false);
    setContactOpen(false);
    setViewUsers(false);
  };
  const closeEditForm = () => {
    openProfile();
  };

  useEffect(() => {
    const data = getCountData();
    setConversations(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatsData]);

  function getCountData() {
    const data = chatsData.map((role) => {
      let count = 0;
      role.chat.messages.map((msg) => {
        if (
          msg.sender.id != getUserId() &&
          msg.read_status == ReadStatus.UNREAD
        ) {
          count++;
        }
        return msg;
      });
      return { ...role, unreadCount: count };
    });
    return data;
  }

  useEffect(() => {
    const jsonUser = window.localStorage.getItem("user");
    if (jsonUser) {
      const user = JSON.parse(jsonUser);
      setUserProf(user);
    }
  }, []);

  const viewChats = () => {
    setViewUsers(true);
    setContactOpen(false);
    setProfileOpen(false);
    setEditOpen(false);
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ${
          contactOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="h-full flex flex-col gap-y-2">
          <div className="w-full h-fit">
            <SearchBar
              openProfile={openProfile}
              user={userProf}
              viewChats={viewChats}
            />
          </div>
          <div className="w-full h-[85vh] mt-0 p-0 overflow-y-scroll scrollbar-none">
            <ContactList onItemClick={onItemClick} chatsData={conversations} />
          </div>
        </div>
      </div>

      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ${
          profileOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {userProf && (
          <UserProfile
            user={userProf}
            closeProfile={closeAllSlides}
            editProfile={openEditForm}
          />
        )}
      </div>

      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ${
          editOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {userProf && (
          <UserProfileEdit
            user={userProf}
            onCancel={closeEditForm}
            notificationAlert={notificationAlert}
            handleLoading={handleLoading}
          />
        )}
      </div>

      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ${
          viewUser ? "translate-x-0" : "translate-x-full"
        }`}>
        {userProf && (
          <UserChats closeUserChat={closeAllSlides} createChat={createChat} />
        )}
      </div>
      {fullScreenMode && (
        <div
          className="absolute bottom-10 right-3 bg-sky-900 text-white text-2xl p-3 rounded-full cursor-pointer"
          onClick={handleFullscreen}>
          <BsArrowsFullscreen />
        </div>
      )}
    </div>
  );
}

export default Index;
