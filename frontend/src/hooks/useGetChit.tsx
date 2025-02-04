import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axiosInstance";
import { toast } from "sonner";

export const useGetChit = (chitId: string) => {
  const [chit, setChit] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const updateChit = (newMessage: any) => {
    setChit((prevChit: any) => {
      if (!prevChit) return prevChit;
      return {
        ...prevChit,
        messages: [...prevChit.messages, newMessage],
      };
    });
  };

  useEffect(() => {
    const getChit = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/message/chit/${chitId}`);
        if (!res.data.success) {
          throw new Error(res.data.error || "Failed to fetch chit");
        }
        setChit(res.data);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    getChit();
  }, [chitId]);

  return { chit, loading, updateChit };
};
