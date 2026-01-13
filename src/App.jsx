import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";
import { POSTS } from "./posts";


const THEME_KEY = "blog_theme_v1";


function safeText(v) {
  return String(v ?? "").trim();
}
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function uniqueTags(posts) {
  const set = new Set(posts.map((p) => p.tag).filter(Boolean));
  return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}

function Header({ query, setQuery }) {
  const searchRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);


  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">✦</span>
          <span className="brand-text">Copenhagen Chronicles</span>
        </Link>

        <nav className="nav desktop-nav">
          <Link to="/#featured">Featured</Link>
          <Link to="/#posts">Posts</Link>
          <Link to="/#about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <button
          className="icon-btn mobile-menu-btn"
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div className="mobile-nav">
            <Link onClick={() => setMenuOpen(false)} to="/#featured">Featured</Link>
            <Link onClick={() => setMenuOpen(false)} to="/#posts">Posts</Link>
            <Link onClick={() => setMenuOpen(false)} to="/#about">About</Link>
            <Link onClick={() => setMenuOpen(false)} to="/contact">Contact</Link>
          </div>
        )}

        <div className="header-actions">
          <label className="search">
            <span className="sr-only">Search posts</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              type="search"
            />
          </label>

          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            <span aria-hidden="true">🌙</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function PostCard({ post }) {
  return (
    <article className="card post-card">
      {post.coverImage ? (
        <div className="cover">
          <img src={post.coverImage} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="meta">
        <span className="pill pill-strong">{post.tag || "General"}</span>
        <span className="pill">{formatDate(post.date)}</span>
      </div>

      <h3>{post.title || "Untitled"}</h3>
      <p className="excerpt">{post.excerpt || ""}</p>

      <div className="actions">
        <Link className="link-btn" to={`/post/${post.id}`}>
          Read more →
        </Link>
        
      </div>
    </article>
  );
}

function Home({ posts, query, tag, setTag, sort, setSort }) {
  const tags = useMemo(() => uniqueTags(posts), [posts]);

  const featured = useMemo(() => {
    if (!posts.length) return null;
    return posts
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = safeText(query).toLowerCase();
    let out = posts.slice();

    if (tag !== "all") out = out.filter((p) => p.tag?.toLowerCase() === tag.toLowerCase());

    if (q) {
      out = out.filter((p) => {
        const hay = `${p.title} ${p.tag} ${p.excerpt} ${p.content}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (sort === "newest") out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (sort === "oldest") out.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    if (sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));

    return out;
  }, [posts, query, tag, sort]);

  return (
    <>
      <section className="splash" aria-label="Intro">
        <div className="splash-overlay">
          <p className="splash-kicker">Copenhagen • Østerbro • DIS</p>
          <h1 className="splash-title">Copenhagen Chronicles</h1>
          <p className="splash-subtitle">
            Weekend trips, student-budget breakdowns, and little life updates from abroad.
          </p>
          <a className="scroll-cue" href="#featured" aria-label="Scroll to featured">
      ↓
    </a>
  </div>
</section>

    <main className="content-over-hero">
      <section id="featured" className="section">
        <div className="container">
          <div className="featured-card">
            <div className="featured-copy">
              <p className="eyebrow">Featured</p>
              <h1>{featured?.title ?? "No posts yet"}</h1>
              <p className="muted">{featured?.excerpt ?? "Add a post to see it featured here."}</p>

              <div className="featured-meta">
                <span className="pill">{formatDate(featured?.date)}</span>
                <span className="pill pill-strong">{featured?.tag ?? "General"}</span>
              </div>

              <div className="featured-actions">
                {featured ? (
                  <Link className="btn btn-primary" to={`/post/${featured.id}`}>
                    Read post
                  </Link>
                ) : (
                  <button className="btn btn-primary" disabled>
                    Read post
                  </button>
                )}
                <a className="btn btn-ghost" href="#posts">
                  Browse all
                </a>
              </div>
            </div>

            <div className="featured-art" aria-hidden="true">
              <div className="blob"></div>
              <div className="featured-stat">
                <div className="stat-num">2–4</div>
                <div className="stat-label">posts / week</div>
              </div>
              <div className="featured-stat second">
                <div className="stat-num">48–72h</div>
                <div className="stat-label">weekend trips</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="posts" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Latest posts</h2>
              <p className="muted">Search, filter by tag, and open any post to read.</p>
            </div>

            <div className="filters">
              <select className="select" value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by tag">
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All tags" : t}
                  </option>
                ))}
              </select>

              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort posts">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </div>
          </div>

          <div className="grid" aria-live="polite">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>

          {filtered.length === 0 && <p className="empty muted">No posts match your search.</p>}
        </div>
      </section>

      <section id="about" className="section">
        <div className="container">
          <div className="card about">
            <h2>About</h2>
            <p className="muted">
              Right now I’m living on Tåsingegade in Østerbro, Copenhagen (a DIS residential spot) and using it as my starting point for basically everything. This blog is my running diary of life abroad — the weekend trips, the real student-budget receipts, the coffee shops, and the random everyday highlights that make Copenhagen feel like home. You can expect regular posts with honest recaps (what I booked, what I spent, what I’d do differently), plus frequent TikToks along the way (<a href="https://www.tiktok.com/@addingup" target="_blank" rel="noreferrer">@addingup</a>) for the quick, real-time updates.
            </p>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

function PostPage({ posts }) {
  const { id } = useParams();

  const post = useMemo(() => posts.find((p) => p.id === id) || null, [posts, id]);


  if (!post) {
    return (
      <div className="container section">
        <div className="card about">
          <h2>Post not found</h2>
          <p className="muted">That link doesn’t match any post in your browser.</p>
          <Link className="btn btn-ghost" to="/">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="post-page">
        <div className="post-top">
          <Link className="link-btn" to="/">
            ← Back
          </Link>
        </div>

        <div className="card post-full">
          {post.coverImage ? (
            <div className="cover cover-large">
              <img src={post.coverImage} alt="" />
            </div>
          ) : null}

          <div className="post-full-head">
            <div className="meta">
              <span className="pill pill-strong">{post.tag || "General"}</span>
              <span className="pill">{formatDate(post.date)}</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="muted">{post.excerpt}</p>
          </div>

          <div className="post-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const formEndpoint = "https://formspree.io/f/xbddjzog";
  const tiktokUrl = "https://www.tiktok.com/@addingup";

  const sent = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("sent") === "1";

  return (
    <div className="container section">
      <div className="card contact-card">
        <h1>Contact</h1>
        <p className="muted">
          Want to say hi, recommend a city, or ask about an itinerary? Send me a message below.
        </p>

        <div className="contact-links">
          <a className="btn btn-primary" href={tiktokUrl} target="_blank" rel="noreferrer">
            TikTok: @addingup →
          </a>
        </div>

        {sent ? (
          <div className="success">
            Message sent ✅ I’ll get back to you soon.
          </div>
        ) : null}

        <form className="contact-form" action={formEndpoint} method="POST">
          {/* send them back to your site after submit */}
          <input type="hidden" name="_redirect" value={`${window.location.origin}/contact?sent=1`} />
          <input type="hidden" name="_subject" value="New message from Copenhagen Chronicles" />

          <label>
            <span className="label">Name</span>
            <input className="input" name="name" placeholder="Your name" required />
          </label>

          <label>
            <span className="label">Email</span>
            <input className="input" type="email" name="email" placeholder="you@email.com" required />
          </label>

          <label>
            <span className="label">Message</span>
            <textarea className="textarea" name="message" rows={6} placeholder="Write your message…" required />
          </label>

          <button className="btn btn-primary" type="submit">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}


function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [email, setEmail] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 900); // always show
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setStatus("idle");
    setEmail("");
  }

  function onSubmit() {
    // IMPORTANT: don't preventDefault; let the form submit to the iframe
    setStatus("sending");

    // We can't reliably read the response from Buttondown (cross-origin),
    // so we show success after the iframe receives the response.
    setTimeout(() => setStatus("success"), 900);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Join the mailing list">
      <div className="modal newsletter-modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Mailing list</p>
            <h3 style={{ margin: 0 }}>Get new posts by email</h3>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              One email when a new post goes live. No spam.
            </p>
          </div>

          <button className="icon-btn" type="button" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Hidden iframe = no navigation away from your site */}
          <iframe
            title="buttondown-hidden"
            name="buttondown_iframe"
            style={{ display: "none" }}
          />

          {status === "success" ? (
            <div className="success">
              You’re in ✅ Check your inbox (and spam) to confirm.
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-primary" type="button" onClick={close}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form
              action="https://buttondown.com/api/emails/embed-subscribe/jacinta"
              method="post"
              target="buttondown_iframe"
              className="embeddable-buttondown-form newsletter-form"
              onSubmit={onSubmit}
            >
              <label htmlFor="bd-email">
                <span className="label">Enter your email</span>
              </label>

              <input
                className="input"
                type="email"
                name="email"
                id="bd-email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Buttondown embed expects this */}
              <input type="hidden" name="embed" value="1" />

              <div className="newsletter-actions">
                <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Subscribing…" : "Subscribe"}
                </button>
                <button className="btn btn-ghost" type="button" onClick={close}>
                  Not now
                </button>
              </div>

              <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                Powered by{" "}
                <a href="https://buttondown.com/refer/jacinta" target="_blank" rel="noreferrer">
                  Buttondown
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [posts] = useState(POSTS);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    // init theme
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <>
      <NewsletterModal />
      <Header query={query} setQuery={setQuery} />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              posts={posts}
              query={query}
              tag={tag}
              setTag={setTag}
              sort={sort}
              setSort={setSort}
            />
          }
        />
        <Route path="/post/:id" element={<PostPage posts={posts} />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="muted">© {new Date().getFullYear()} Copenhagen Chronicles</p>
          <Link className="muted" to="/#featured">
            Back to top ↑
          </Link>
        </div>
      </footer>
    </>
  );
}
