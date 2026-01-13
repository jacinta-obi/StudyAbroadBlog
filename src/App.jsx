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

        <nav className="nav">
          <Link to="/#featured">Featured</Link>
          <Link to="/#posts">Posts</Link>
          <Link to="/#about">About</Link>
        </nav>

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
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Copenhagen Chronicles</h1>
          <p className="hero-subtitle muted">
            Weekend trips, student-budget breakdowns, and little life updates from abroad.
          </p>
        </div>
    </section>
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
            <p className="muted">This is now a tiny “real” blog app: routes + markdown + uploads.</p>
          </div>
        </div>
      </section>
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
