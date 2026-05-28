import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { addToCartFn, submitContactFn } from "@/lib/luxehair.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LuxeHair – TRESemmé Premium Hair Care" },
      {
        name: "description",
        content:
          "Salon-quality TRESemmé hair care crafted with rare botanicals. Shampoos, conditioners, treatments and luxury gift sets.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Jomolhari&family=Playfair+Display:wght@400;600&family=Instrument+Sans:wght@400;500&family=Inria+Serif:wght@400;700&family=IM+Fell+Double+Pica&display=swap",
      },
      { rel: "stylesheet", href: "/css/luxehair.css" },
    ],
  }),
  component: LuxeHair,
});

function goTo(selector: string) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function LuxeHair() {

  const [toast, setToast] = useState("");
  const [show, setShow] = useState(false);
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; img: string; qty: number }[]
  >([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setShow(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 2800);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const PRODUCT_META: Record<string, { price: number; img: string }> = {
    "TRESemmé Keratin Smooth Shampoo": { price: 449, img: "/images/p1.png" },
    "TRESemmé Botanique Nourish & Replenish": { price: 349, img: "/images/p2.png" },
    "TRESemmé Pro Protect Shampoo": { price: 435, img: "/images/p3.png" },
    "TRESemmé Hair Fall Defence Shampoo": { price: 399, img: "/images/p4.png" },
    "TRESemmé Keratin Smooth": { price: 449, img: "/images/p1.png" },
  };

  const handleAdd = async (name: string) => {
    const meta = PRODUCT_META[name] || { price: 399, img: "/images/p1.png" };
    setCartItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) return prev.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now() + Math.random());
      return [...prev, { id, name, price: meta.price, img: meta.img, qty: 1 }];
    });
    setCartOpen(true);
    showToast(`${name} added to cart!`);
    try {
      await addToCartFn({ item: name });
    } catch (err) {
      console.warn("Cart backend error:", err);
    }
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Item removed from cart");
  };

  const handleQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const nq = i.qty + delta;
        return nq <= 0 ? [] : [{ ...i, qty: nq }];
      }),
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutDone(true);
    setCartItems([]);
    showToast("Order placed successfully!");
    setTimeout(() => setCheckoutDone(false), 3500);
  };

  const handleContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      showToast("Please complete all fields.");
      return;
    }
    try {
      const res = await submitContactFn(payload);
      showToast(res.message);
      if (res.ok) form.reset();
    } catch (err) {
      console.error(err);
      showToast("Server unavailable. Please try again later.");
    }
  };

  const products = [
    {
      name: "TRESemmé Keratin Smooth Shampoo",
      desc: "Anti-frizz formula with keratin protein that penetrates deep into the hair shaft for silky smooth results from first wash.",
      price: "₹ 449",
      img: "/images/p1.png",
      bg: "linear-gradient(135deg,#e8eeff 0%,#d4dcf5 100%)",
    },
    {
      name: "TRESemmé Botanique Nourish & Replenish",
      desc: "Coconut milk and aloe vera formula that deeply nourishes, detangles and adds long-lasting shine without weighing hair down.",
      price: "₹ 349",
      img: "/images/p2.png",
      bg: "linear-gradient(135deg,#e8f5ec 0%,#d4edda 100%)",
    },
    {
      name: "TRESemmé Pro Protect Shampoo",
      desc: "Sulphate-free formula with Moroccan Argan Oil. Gently cleanses and nourishes while maintaining vibrant colour and shine.",
      price: "₹ 435",
      img: "/images/p3.png",
      bg: "linear-gradient(135deg,#f5f0ff 0%,#ede8f5 100%)",
    },
    {
      name: "TRESemmé Hair Fall Defence Shampoo",
      desc: "Keratin protein powered formula that gives up to 97% less hair breakage after one wash, leaving hair longer and stronger.",
      price: "₹ 399",
      img: "/images/p4.png",
      bg: "linear-gradient(135deg,#fff5f0 0%,#ffe8e0 100%)",
    },
  ];

  const minis = [
    { name: "Keratin Smooth", price: "₹ 449", img: "/images/p1.png" },
    { name: "Botanique Nourish", price: "₹ 349", img: "/images/p2.png" },
    { name: "Pro Protect", price: "₹ 435", img: "/images/p3.png" },
    { name: "Hair Fall Defence", price: "₹ 399", img: "/images/p4.png" },
  ];

  return (
    <>
      <nav className="navbar">
        <a
          className="nav-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            goTo("#hero");
          }}
        >
          LuxeHair
        </a>
        <ul className="nav-links">
          <li>
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                goTo("#hero");
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                goTo("#products");
              }}
            >
              Products
            </a>
          </li>
          <li>
            <a
              href="#feature"
              onClick={(e) => {
                e.preventDefault();
                goTo("#feature");
              }}
            >
              About Us
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              onClick={(e) => {
                e.preventDefault();
                goTo("#testimonials");
              }}
            >
              Reviews
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                goTo("#contact");
              }}
            >
              Contact
            </a>
          </li>
        </ul>
        <button className="nav-cta" onClick={() => setCartOpen(true)}>
          SHOP NOW {cartCount > 0 ? `(${cartCount})` : ""}
        </button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-glow1"></div>
        <div className="hero-glow2"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-label">Premium Hair Care</span>
            <h1 className="hero-title">
              Stronger, Smoother <span>Hair Starts Here</span>
            </h1>
            <p className="hero-sub">
              Salon-quality formulas crafted with rare botanicals. Transform your hair from the
              first wash — guaranteed.
            </p>
            <div className="hero-btns">
              <button
                className="btn-gold"
                onClick={() => handleAdd("TRESemmé Keratin Smooth Shampoo")}
              >
                Buy Now
              </button>
              <button className="btn-outline" onClick={() => goTo("#feature")}>
                Explore Range
              </button>
            </div>
          </div>
          <div className="hero-bottle">
            <img
              src="/images/g1.png"
              alt="TRESemmé Keratin Smooth Shampoo"
              onClick={() => handleAdd("TRESemmé Keratin Smooth Shampoo")}
            />
          </div>
        </div>
      </section>

      <section className="strip" id="strip">
        {minis.map((m) => (
          <div className="mini-card" key={m.name} onClick={() => goTo("#products")}>
            <div className="mini-card-img">
              <img src={m.img} alt={m.name} />
            </div>
            <div className="mini-card-body">
              <div className="mini-name">{m.name}</div>
              <div className="mini-price">{m.price}</div>
            </div>
          </div>
        ))}
        <div className="mini-card" onClick={() => goTo("#products")}>
          <div className="mini-card-img mini-card-img--column">
            <img src="/images/g1.png" alt="Gift Set" className="mini-img-gift" />
            <span className="mini-badge-label">GIFT SET</span>
          </div>
          <div className="mini-card-body">
            <div className="mini-name">Luxury Gift Set</div>
            <div className="mini-price">₹ 999</div>
          </div>
        </div>
      </section>

      <section className="feature" id="feature">
        <div className="feat-img-box">
          <img src="/images/all1.png" alt="TRESemmé Collection" />
        </div>
        <div className="feat-text-box">
          <span className="feat-label">Limited Collection</span>
          <h2 className="feat-title">Advanced Repair for All Hair Types</h2>
          <p className="feat-body">
            Our clinically tested TRESemmé formula penetrates deep into the hair shaft, restoring
            moisture balance and eliminating frizz — no matter your hair type.
          </p>
          <div className="feat-tags">
            <span className="feat-tag">Sulphate Free</span>
            <span className="feat-tag">Clinically Tested</span>
            <span className="feat-tag">Keratin Infused</span>
            <span className="feat-tag">Pro Formula</span>
          </div>
          <div className="feat-actions">
            <button className="btn-gold" onClick={() => handleAdd("TRESemmé Keratin Smooth")}>
              Buy Now
            </button>
            <button className="btn-outline" onClick={() => goTo("#products")}>
              See All Products
            </button>
          </div>
        </div>
      </section>

      <section className="bestsellers" id="products">
        <span className="section-label">Top Picks</span>
        <h2 className="section-title">Our Best Sellers</h2>
        <div className="products-grid">
          {products.map((p) => (
            <div className="prod-card" key={p.name}>
              <div className="prod-card-img-wrap" style={{ background: p.bg }}>
                <img src={p.img} alt={p.name} />
              </div>
              <div className="prod-card-body">
                <div className="prod-card-name">{p.name}</div>
                <div className="prod-card-desc">{p.desc}</div>
                <div className="prod-card-price">{p.price}</div>
                <div className="prod-btns">
                  <button className="btn-cart" onClick={() => handleAdd(p.name)}>
                    ADD TO CART
                  </button>
                  <button className="btn-xplore">EXPLORE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <span className="section-label">What Our Customers Say</span>
        <h2 className="section-title">Real Results, Real People</h2>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">
              "The TRESemmé Keratin Smooth is life-changing! My frizzy hair is now completely tamed.
              I use it every wash and results are incredible."
            </p>
            <div className="testi-author">Priya Sharma</div>
            <div className="testi-role">Mumbai, India</div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">
              "Hair Fall Defence shampoo really works! Noticeable difference in 3 weeks. My hair
              feels thicker and I see way less hair in the drain."
            </p>
            <div className="testi-author">Kavya Reddy</div>
            <div className="testi-role">Hyderabad, India</div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">
              "Botanique Nourish smells divine and leaves hair silky. Bought the gift set for my
              sister and she's obsessed with TRESemmé now!"
            </p>
            <div className="testi-author">Arjun Mehta</div>
            <div className="testi-role">Delhi, India</div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-inner">
          <div className="contact-text">
            <span className="section-label">Need help?</span>
            <h2 className="section-title">Contact our LuxeHair support team</h2>
            <p className="feat-body">
              Send us your hair concerns, product questions, or order inquiries. We'll respond with
              styling tips and the best product match.
            </p>
          </div>
          <form className="contact-form" id="contact-form" onSubmit={handleContact}>
            <label htmlFor="contact-name">Name</label>
            <input
              className="contact-input"
              id="contact-name"
              name="name"
              type="text"
              placeholder="Your name"
              required
            />
            <label htmlFor="contact-email">Email</label>
            <input
              className="contact-input"
              id="contact-email"
              name="email"
              type="email"
              placeholder="Your email"
              required
            />
            <label htmlFor="contact-message">Message</label>
            <textarea
              className="contact-textarea"
              id="contact-message"
              name="message"
              rows={5}
              placeholder="Tell us what you're looking for"
              required
            ></textarea>
            <button className="contact-submit" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="footer-top">
          <div className="footer-col">
            <span className="footer-brand-name">LuxeHair</span>
            <p className="footer-brand-desc">
              Premium TRESemmé hair care — formulated with rare botanicals and cutting-edge science
              for hair that turns heads everywhere.
            </p>
            <button
              className="btn-gold"
              onClick={() => goTo("#products")}
              style={{ fontSize: 14, padding: "11px 26px" }}
            >
              Shop Now
            </button>
          </div>
          <div className="footer-col">
            <span className="footer-col-head">Shop</span>
            <ul>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#products");
                  }}
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#products");
                  }}
                >
                  Shampoos
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#products");
                  }}
                >
                  Conditioners
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#products");
                  }}
                >
                  Treatments
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#products");
                  }}
                >
                  Gift Sets
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <span className="footer-col-head">Help</span>
            <ul>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#contact");
                  }}
                >
                  Hair Quiz
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#contact");
                  }}
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#contact");
                  }}
                >
                  Returns
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#contact");
                  }}
                >
                  Track Order
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#contact");
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <span className="footer-col-head">Company</span>
            <ul>
              <li>
                <a
                  href="#feature"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#feature");
                  }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#feature"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#feature");
                  }}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#feature"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#feature");
                  }}
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#feature"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#feature");
                  }}
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href="#feature"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("#feature");
                  }}
                >
                  Sustainability
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-socials">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </footer>

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-head">
              <div>
                <h3>Shopping Bag</h3>
                <span className="cart-sub">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </span>
              </div>
              <button className="cart-close" onClick={() => setCartOpen(false)}>
                ✕
              </button>
            </div>

            {checkoutDone ? (
              <div className="cart-success">
                <div className="cart-success-icon">✓</div>
                <h4>Order Placed!</h4>
                <p>Thank you for shopping with LuxeHair. We'll email your receipt shortly.</p>
                <button
                  className="btn-gold"
                  onClick={() => {
                    setCheckoutDone(false);
                    setCartOpen(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="cart-body">
                  {cartItems.length === 0 ? (
                    <div className="cart-empty-wrap">
                      <div className="cart-empty-icon">🛍️</div>
                      <p className="cart-empty">Your bag is empty</p>
                      <span className="cart-empty-sub">Add some luxe to your routine</span>
                      <button
                        className="btn-gold"
                        onClick={() => {
                          setCartOpen(false);
                          goTo("#products");
                        }}
                      >
                        Shop Products
                      </button>
                    </div>
                  ) : (
                    cartItems.map((it) => (
                      <div className="cart-item" key={it.id}>
                        <div className="cart-item-img">
                          <img src={it.img} alt={it.name} />
                        </div>
                        <div className="cart-item-info">
                          <div className="cart-item-name">{it.name}</div>
                          <div className="cart-item-price">₹ {it.price}</div>
                          <div className="cart-item-controls">
                            <div className="qty-group">
                              <button onClick={() => handleQty(it.id, -1)}>−</button>
                              <span>{it.qty}</span>
                              <button onClick={() => handleQty(it.id, 1)}>+</button>
                            </div>
                            <button className="cart-item-del" onClick={() => handleRemove(it.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="cart-item-line">₹ {it.price * it.qty}</div>
                      </div>
                    ))
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="cart-foot">
                    <div className="cart-row">
                      <span>Subtotal</span>
                      <span>₹ {subtotal}</span>
                    </div>
                    <div className="cart-row">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹ ${shipping}`}</span>
                    </div>
                    <div className="cart-row">
                      <span>Tax (5%)</span>
                      <span>₹ {tax}</span>
                    </div>
                    <div className="cart-row cart-total">
                      <span>Total</span>
                      <span>₹ {grandTotal}</span>
                    </div>
                    {subtotal < 999 && (
                      <div className="cart-hint">Add ₹ {999 - subtotal} more for FREE shipping</div>
                    )}
                    <button className="btn-gold cart-checkout" onClick={handleCheckout}>
                      Checkout — ₹ {grandTotal}
                    </button>
                    <button
                      className="cart-continue"
                      onClick={() => {
                        setCartOpen(false);
                        goTo("#products");
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}

      <div className={`toast${show ? " show" : ""}`} id="toast">
        {toast}
      </div>
    </>
  );
}
