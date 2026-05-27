import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const addToCartFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ item: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .insert({ item: data.item });
    if (error) {
      console.error("cart insert error", error);
      return { ok: false, message: "Could not add to cart." };
    }
    return { ok: true, message: "Item added to cart." };
  });

export const submitContactFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(100),
        email: z.string().email().max(200),
        message: z.string().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .insert(data);
    if (error) {
      console.error("contact insert error", error);
      return { ok: false, message: "Could not send. Try again soon." };
    }
    return { ok: true, message: "Thank you! Your message has been received." };
  });
