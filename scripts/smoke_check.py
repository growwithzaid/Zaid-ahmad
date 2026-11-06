from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'dist'
PAGES = ['index.html', 'development/index.html', 'seo/index.html']
SKIP_PREFIXES = ('http:', 'https:', 'mailto:', 'tel:', '#', 'javascript:')

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.title = False
        self.description = False
        self.canonical = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src'):
            value = attrs.get(key, '')
            if value:
                self.refs.append(value)
        if tag == 'meta' and attrs.get('name') == 'description' and attrs.get('content'):
            self.description = True
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = True

    def handle_data(self, data):
        if data.strip() and '<title' in getattr(self, 'get_starttag_text', lambda: '')():
            self.title = True

errors = []
contents = []
for page in PAGES:
    path = ROOT / page
    if not path.is_file():
        errors.append(f'Missing route: {page}')
        continue
    text = path.read_text(encoding='utf-8')
    contents.append(text)
    parser = Links()
    parser.feed(text)
    if '<title>' not in text or not parser.description or not parser.canonical:
        errors.append(f'Missing title/description/canonical metadata: {page}')
    for ref in parser.refs:
        if ref.startswith(SKIP_PREFIXES):
            continue
        target = (path.parent / ref.split('#', 1)[0].split('?', 1)[0]).resolve()
        if not target.exists():
            errors.append(f'{page}: broken local reference {ref}')
all_text = '\n'.join(contents)
for text in ('Batia House', 'panpan.zaid@gmail.com', 'Two Hearts Study', 'seo-1.mp4'):
    if text in all_text:
        errors.append(f'Excluded/private content appears in page source: {text}')
required = ['assets/cv/Zaid-Ahmad-CV.pdf', 'assets/memes/developer-1.jpg', 'assets/sold/sold-cover.png', 'robots.txt', 'sitemap.xml']
for item in required:
    if not (ROOT / item).is_file():
        errors.append(f'Missing required output: {item}')
if (ROOT / 'assets/documents/zaid-ahmad-gazi-resume.pdf').exists():
    errors.append('Original CV unexpectedly present in deploy artifact')
if errors:
    raise SystemExit('\n'.join(errors))
print('Static output check passed: three routes, local references, metadata, selected assets, safe CV, exclusions.')
