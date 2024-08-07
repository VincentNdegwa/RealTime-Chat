/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import ChatSide from "./pages/chatSide";
import Overlay from "./pages/Components/Overlay";
import SideBar from "./pages/sidebar";
import { useEffect, useRef, useState } from "react";
import useCustomAxios from "./modules/customAxios";
import { getUser, getUserId } from "./modules/getUserId";
import Loading from "./pages/Components/Loading";
import AlertNotification from "./pages/Components/AlertNotification";
import {
  Chat,
  Participant,
  ReadStatus,
  Role,
  RoleList,
  User,
  alertType,
  callMode,
  callerData,
} from "./types";
import ErrorPage from "./pages/Components/ErrorPage";
import { AxiosError } from "axios";
import CallPage from "./pages/CallPage/Index";
import StartPage from "./pages/startPage";
import CustomSocket from "./modules/CustomSocket";
type Props = {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  openOverlayProfile: (participant: Participant) => void;
  isOverLayOpen: boolean;
  setOperLayOpen: (isOpen: boolean) => void;
  component: JSX.Element | undefined;
  overLayHeader: string;
};

const socket = CustomSocket.getSocket();

function MainLayout({
  isChatOpen,
  setIsChatOpen,
  openOverlayProfile,
  isOverLayOpen,
  setOperLayOpen,
  component,
  overLayHeader,
}: Props) {
  const axios = useCustomAxios();
  const [userId, setUserId] = useState<number | string | null>(getUserId());
  const [currentUser, setCurrentUser] = useState<User | null>(getUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<alertType>({ message: "", type: "info" });
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatsData, setChatsData] = useState<RoleList>([]);
  const [singleChat, setSingleChat] = useState<any>([]);
  const [newCall, SetNewCall] = useState<callerData>();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [startCall, setStartCall] = useState<callerData>({
    start: false,
    mode: callMode.VOICE,
    sender: undefined,
    receiver: undefined,
  });

  const [incommingCall, SetIncommingCall] = useState<boolean>(false);
  const navigate = useNavigate();
  const navigateOpenChat = (chatId: number) => {
    window.localStorage.removeItem("chatId");
    window.localStorage.setItem("chatId", JSON.stringify(chatId));
    const chats = chatsData.find((chatItem) => chatItem.chat.id === chatId);
    if (chats) {
      setIsChatOpen(true);
      setSingleChat(chats);
    }
  };

  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  const handleFullscreen = async () => {
    if (isMobileDevice()) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
    } else {
      setIsFullscreen(true);
    }
  };
  window.addEventListener("fullscreenchange", handleFullScreenChange);

  useEffect(() => {
    if (isMobileDevice() && buttonRef.current) {
      buttonRef.current.click();
    }
  }, []);

  useEffect(() => {
    const userId = getUserId();
    socket.emit("join", userId);

    socket.on("call-user", (data) => {
      SetNewCall(data);
    });
  }, [newCall]);

  useEffect(() => {
    const uid = getUserId();
    const us = getUser();
    if (uid && us) {
      setUserId(uid);
      socket.emit("join", uid);
      setCurrentUser(us);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const uid = getUserId();
    if (uid) {
      socket.emit("join", getUserId());
    }
  }, []);

  useEffect(() => {
    const handleMessageReceived = (message: any) => {
      const newMessage = message.data;

      const chatIndex = chatsData.findIndex(
        (chat) => chat.chat.id === newMessage.chat.id
      );

      if (chatIndex !== -1) {
        const newChat: Chat = { ...chatsData[chatIndex].chat };
        newChat.lastMessage = { ...newMessage };
        newChat.messages = [...newChat.messages, { ...newMessage }];

        const updatedChats = [...chatsData];

        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift({
          ...chatsData[chatIndex],
          chat: newChat,
        });

        setChatsData([...updatedChats]);
      }
    };

    socket.on("messageReceived", handleMessageReceived);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
    };
  }, [chatsData]);

  useEffect(() => {
    const handleMessageRead = (data: {
      senderId: string | number;
      chatId: string | number;
      messageIds: (number | string)[];
    }) => {
      setChatsData((prevChatsData) => {
        const updatedChat = prevChatsData.map((role) => {
          if (role.chat.id == data.chatId) {
            const messagesToUpdate = role.chat.messages.map((msg) => {
              if (data.messageIds.includes(msg.id)) {
                return { ...msg, read_status: ReadStatus.READ };
              }
              return msg;
            });

            return {
              ...role,
              chat: { ...role.chat, messages: messagesToUpdate },
            };
          }
          return role;
        });
        return updatedChat;
      });
    };

    socket.on("readMessage", handleMessageRead);

    return () => {
      socket.off("readMessage", handleMessageRead);
    };
  }, []);

  const addNewRole = (role: Role) => {
    setChatsData((prev) => [role, ...prev]);
  };

  useEffect(() => {
    if (newCall && newCall.start) {
      SetIncommingCall(true);
    }
  }, [newCall, incommingCall]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        if (userId) {
          axios
            .get(`/chats/user/${userId}`)
            .then((res) => {
              const { error, message, data } = res.data;
              if (!error) {
                setLoading(false);
                setChatsData(data);
              } else {
                setAlert({ message: message, type: "error" });
                setAlertVisible(true);
              }
            })
            .catch((err) => {
              const errorMessage = err;
              setError(errorMessage);
            });
        } else {
          console.log("failed to get UserId");
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          const errorMessage = error.response.data.message;
          setError(errorMessage);
        } else {
          setError("Something went wrong");
        }
      }
    };
    fetchData();
  }, [axios, userId]);

  useEffect(() => {
    setSingleChat(singleChat);
    const chatId = Number(window.localStorage.getItem("chatId"));
    if (chatId) {
      const chats = chatsData.find((chatItem) => chatItem.chat.id === chatId);
      if (chats) {
        setSingleChat(chats);
      }
    }
  }, [singleChat, chatsData]);

  const displayNotification = (alert: alertType) => {
    setAlertVisible(true);
    setAlert(alert);
  };
  const handleLoading = (status: boolean) => {
    setLoading(status);
  };

  const createChat = (user: User) => {
    const data = chatsData.find((item) =>
      item.chat.participants.some((x) => x.user.id === user.id)
    );
    if (data) {
      setSingleChat(data);
      window.localStorage.setItem("chatId", JSON.stringify(data.chat.id));
    } else {
      window.localStorage.removeItem("chatId");
      if (currentUser) {
        const newRole: Role = {
          id: 100,
          role: "string",
          chat: {
            id: 100,
            created_at: new Date().toISOString(),
            participants: [
              { id: user.id, role: "user", user: user },
              { id: Number(userId), role: "user", user: currentUser },
            ],
            lastMessage: null,
            messages: [],
          },
        };
        setSingleChat(newRole);
      }
    }
    setIsChatOpen(true);
    //  console.log(chatsData);
  };
  const handleCall = (callType: {
    mode: callMode;
    sender: Participant | undefined;
    receiver: Participant | undefined;
  }) => {
    setStartCall({
      start: true,
      mode: callType.mode,
      sender: callType.sender,
      receiver: callType.receiver,
    });
  };

  useEffect(() => {
    function handkeKeyPress(event: KeyboardEvent) {
      if (event.key == "Escape") {
        window.localStorage.removeItem("chatId");
        setIsChatOpen(false);
        setSingleChat(false);
        console.log(event.key);
      }
    }
    window.addEventListener("keydown", handkeKeyPress);
  });

  if (loading) {
    return <Loading />;
  }
  if (error) return <ErrorPage message={error} />;

  if (startCall.start) {
    return <CallPage mode={startCall} incommingCall={incommingCall} />;
  }
  if (newCall) {
    return <CallPage mode={newCall} incommingCall={incommingCall} />;
  }
  return (
    <div className="flex h-full w-full md:divide-x">
      {alertVisible && alert.message && (
        <AlertNotification
          message={alert.message}
          type={alert.type}
          onClose={() => setAlertVisible(false)}
        />
      )}
      <div
        className={`w-full ${
          isChatOpen ? "hidden" : "block"
        } md:w-2/6 md:block text-sky-950 sticky top-0 left-0 h-full`}>
        <div className="h-full">
          <SideBar
            onItemClick={(chatId: number) => navigateOpenChat(chatId)}
            chatsData={chatsData}
            notificationAlert={displayNotification}
            handleLoading={handleLoading}
            createChat={createChat}
            fullScreenMode={!isFullscreen && isMobileDevice()}
            handleFullscreen={handleFullscreen}
          />
        </div>
      </div>
      <div
        className={`w-full ${
          isChatOpen ? "block" : "hidden"
        } md:w-4/6 md:block`}>
        <>
          {singleChat ? (
            <ChatSide
              onItemClick={() => setIsChatOpen(!isChatOpen)}
              openProfile={(participant: Participant) =>
                openOverlayProfile(participant)
              }
              chatData={singleChat}
              handleCall={handleCall}
              addNewRole={addNewRole}
            />
          ) : (
            <StartPage />
          )}
        </>
      </div>
      <Overlay
        isOverLayOpen={isOverLayOpen}
        closeOverLay={() => setOperLayOpen(false)}
        component={component}
        overLayHeader={overLayHeader}
      />
    </div>
  );
}

export default MainLayout;
