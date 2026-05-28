import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const addToCartFn = async (input: { item: string }) => {
  const data = z.object({ item: z.string().min(1).max(200) }).parse(input);
  
  const { error } = await supabase.from("cart_items").insert({ item: data.item });
  if (error) {
    console.error("cart insert error", error);
    return { ok: false, message: "Could not add to cart." };
  }
  return { ok: true, message: "Item added to cart." };
};

export const submitContactFn = async (input: { name: string; email: string; message: string }) => {
  const data = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(200),
    message: z.string().min(1).max(2000),
  }).parse(input);

  const { error } = await supabase.from("contact_messages").insert(data);
  if (error) {
    console.error("contact insert error", error);
    return { ok: false, message: "Could not send. Try again soon." };
  }
  return { ok: true, message: "Thank you! Your message has been received." };
};
