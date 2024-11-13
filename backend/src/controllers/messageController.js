import prisma from "../db/prisma.js";
import { MessageStatus } from "@prisma/client";
import { getReceiverSocketId } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
  try {
    const { message, isViaEB } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Message body is required" });
    }

    // Validate receiver
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    // Validate sender
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    // Determine EB user if message is via EB
    let EBId = null;
    if (isViaEB) {
      const EBUser = await prisma.user.findFirst({
        where: { role: "EB", committee: sender.committee },
      });
      if (!EBUser)
        return res
          .status(404)
          .json({ message: "No EB found for this committee" });
      EBId = EBUser.id;
    }

    // Create or fetch conversation
    const conversation = await prisma.conversation.create({
      data: { participantIds: [senderId, receiverId] },
    });

    // Update conversation ID for both users
    await prisma.user.updateMany({
      where: { id: { in: [senderId, receiverId] } },
      data: { conversationIds: { push: conversation.id } },
    });

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        body: message,
        senderId,
        conversationId: conversation.id,
        isViaEB,
        status: isViaEB ? MessageStatus.PENDING : MessageStatus.APPROVED,
      },
    });

    // Emit the message to the receiver (or EB if via EB)
    const receiverSocketId = getReceiverSocketId(isViaEB ? EBId : receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userToChatId],
        },
      },
      include: {
        messages: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!conversation) return res.status(200).json([]);
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserForSidebar = async (req, res) => {
  try {
    const authUserId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: authUserId,
        },
        role: {
          in: ["DELEGATE"],
        },
      },
      select: {
        id: true,
        username: true,
        portfolio: true,
        committee: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUserForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const replyMessage = async (req, res) => {
  const { message, isViaEB } = req.body;
  const { id: conversationId } = req.params;
  const senderId = req.user.id;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // Identify the receiver as the participant who isn't the sender
    const receiverId = conversation.participantIds.find(
      (id) => id !== senderId
    );
    console.log(conversation.participantIds, senderId, receiverId);

    // Ensure receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    // Fetch EB for the committee if the message is via EB
    let EB = null;
    if (isViaEB) {
      EB = await prisma.user.findFirst({
        where: { role: "EB", committee: receiver.committee },
      });
      if (!EB)
        return res
          .status(404)
          .json({ message: "No EB found for this committee" });
    }

    // Create the new message
    const newMessage = await prisma.message.create({
      data: {
        body: message,
        senderId,
        conversationId,
        isViaEB,
        status: isViaEB ? MessageStatus.PENDING : MessageStatus.APPROVED,
      },
    });

    // Emit to the appropriate socket (EB or receiver)
    const receiverSocketId = getReceiverSocketId(isViaEB ? EB.id : receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in replying to messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
