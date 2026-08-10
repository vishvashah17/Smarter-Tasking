import re

with open('static/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove bottom section
bottom_idx = css.find('/* ============================================' + '\n' + '   SECTION THEMES')
if bottom_idx != -1:
    css = css[:bottom_idx]

# 2. Remove body.theme-history block at line 450-528
theme_hist_idx = css.find('/* — History: Modern Light')
if theme_hist_idx != -1:
    end_hist_idx = css.find('/* — History page layout — */')
    if end_hist_idx != -1:
        css = css[:theme_hist_idx] + css[end_hist_idx:]

# 3. Strip all body.theme-history prefixes
css = css.replace('body.theme-history ', '')

# 4. Replace :root and base styles
root_pattern = re.compile(r':root\s*\{.*?\}(?=\s*/\* — Reset & Base — \*/)', re.DOTALL)
new_root = ''':root {
  /* — Color Palette : Classy Light Theme — */
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-card: rgba(255, 255, 255, 0.9);
  --bg-card-hover: rgba(255, 255, 255, 1);
  --bg-glass: rgba(148, 163, 184, 0.1);
  --bg-input: rgba(255, 255, 255, 0.7);
  
  --border: rgba(148, 163, 184, 0.25);
  --border-focus: rgba(99, 102, 241, 0.5);
  
  --text: #0f172a;
  --text-muted: #475569;
  --text-dim: #64748b;
  
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-glow: rgba(99, 102, 241, 0.15);
  
  --success: #10b981;
  --success-glow: rgba(16, 185, 129, 0.15);
  
  --danger: #ef4444;
  --danger-glow: rgba(239, 68, 68, 0.15);
  
  --warning: #f59e0b;
  
  --gradient-1: linear-gradient(135deg, #6366f1, #3b82f6);
  --gradient-hero: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);

  /* — Typography — */
  --font: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* — Effects & Sharp Edges — */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 30px var(--accent-glow);

  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;

  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}'''
css = root_pattern.sub(new_root, css)

base_pattern = re.compile(r'/\* — Background ambient glow — \*/.*\}(?=\s*/\* ============================================\s+NAVBAR)', re.DOTALL)
new_base = '''/* — Background ambient glow — */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%);
  animation: ambientShimmer 15s ease-in-out infinite alternate;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: ambientGrid 40s linear infinite;
}

@keyframes ambientShimmer {
  0%   { opacity: 0.9; }
  100% { opacity: 1; }
}

@keyframes ambientGrid {
  from { transform: translate(0, 0); }
  to   { transform: translate(60px, 60px); }
}
'''
css = base_pattern.sub(new_base, css)

navbar_pattern = re.compile(r'\.navbar \{.*?\}(?=\s*\.nav-links)', re.DOTALL)
new_navbar = '''.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 64px;
  background: rgba(248, 250, 252, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: var(--transition);
}'''
css = navbar_pattern.sub(new_navbar, css)

with open('static/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Success')
