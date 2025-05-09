import React from "react";

// React icons
import { FaPencilAlt } from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import {
    TbLayoutSidebarRightCollapseFilled,
    TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";

// Components
import RenameGroupModal from "../modals/RenameGroupModal";
import ChatActionsMenu from "./ChatActionsMenu";

const ChatHeader = ({
    chatTitle,
    chatType,
    creatorID,
    currentUserID,
    isRenameModalOpen,
    setIsRenameModalOpen,
    newGroupName,
    setNewGroupName,
    handleRenameGroup,
    fetchNonMembers,
    setIsAddMemberOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    onFind,
    onDelete,
    onLeaveGroup,
}) => {
    return (
        <div className="p-4 flex justify-between items-center bg-white shadow-md">
            {/* Title & icon */}
            <div className="flex items-center gap-3 ml-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white uppercase">
                    {chatType === "Private" && chatTitle
                        ? chatTitle.split(" ").map((word) => word.charAt(0)).join("").slice(0, 2)
                        : chatTitle?.charAt(0)}
                </div>

                <h2 className="text-xl font-bold truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                    {chatTitle}
                </h2>

                {chatType === "Group" && (
                    <div className="relative">
                        <FaPencilAlt
                            onClick={() => {
                                setNewGroupName(chatTitle);
                                setIsRenameModalOpen(true);
                            }}
                            className="cursor-pointer text-[var(--color-overlay-dark)] hover:text-[var(--color-overlay)] transition"
                        />
                        {isRenameModalOpen && (
                            <RenameGroupModal
                                currentName={chatTitle}
                                newName={newGroupName}
                                setNewName={setNewGroupName}
                                onCancel={() => setIsRenameModalOpen(false)}
                                onSave={() => {
                                    handleRenameGroup(newGroupName);
                                    setIsRenameModalOpen(false);
                                }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 text-[var(--color-overlay-dark)] text-lg mr-4">
                {chatType === "Group" && creatorID === currentUserID && (
                    <TiUserAdd
                        className="cursor-pointer hover:text-[var(--color-overlay)]"
                        onClick={() => {
                            fetchNonMembers();
                            setIsAddMemberOpen(true);
                        }}
                    />
                )}

                <ChatActionsMenu
                    chatType={chatType}
                    creatorID={creatorID}
                    currentUserID={currentUserID}
                    onFind={onFind}
                    onPin={() => console.log("Pin clicked")}
                    onDelete={onDelete}
                    onLeaveGroup={onLeaveGroup}
                />

                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? (
                        <TbLayoutSidebarLeftCollapseFilled className="cursor-pointer text-2xl hover:text-[var(--color-overlay)]" />
                    ) : (
                        <TbLayoutSidebarRightCollapseFilled className="cursor-pointer text-2xl hover:text-[var(--color-overlay)]" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;