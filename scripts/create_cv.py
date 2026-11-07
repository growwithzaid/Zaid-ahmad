from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

out = Path(__file__).resolve().parents[1] / 'assets' / 'cv' / 'Zaid-Ahmad-CV.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
ink, gold, muted = colors.HexColor('#191916'), colors.HexColor('#9b7522'), colors.HexColor('#5f5c55')
s = getSampleStyleSheet()
s.add(ParagraphStyle(name='Name', parent=s['Title'], fontName='Helvetica-Bold', fontSize=26, leading=29, textColor=ink, alignment=TA_LEFT, spaceAfter=3))
s.add(ParagraphStyle(name='Tag', parent=s['Normal'], fontName='Helvetica', fontSize=9, leading=12, textColor=gold, spaceAfter=7))
s.add(ParagraphStyle(name='Contact', parent=s['Normal'], fontName='Helvetica', fontSize=8, leading=12, textColor=muted))
s.add(ParagraphStyle(name='Section', parent=s['Heading2'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=gold, spaceBefore=10, spaceAfter=4))
s.add(ParagraphStyle(name='BodySmall', parent=s['BodyText'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=ink, spaceAfter=2))
s.add(ParagraphStyle(name='MutedSmall', parent=s['BodyText'], fontName='Helvetica', fontSize=8, leading=11, textColor=muted))
def p(text, style='BodySmall'): return Paragraph(text, s[style])
story = [p('ZAID AHMAD','Name'), p('BCA STUDENT  |  DEVELOPER  |  SEO LEARNER','Tag'), p('growwithzaid.gazi@gmail.com  |  +91 8447860830','Contact'), p('github.com/growwithzaid  |  linkedin.com/in/zaidahmadgazi/  |  instagram.com/growwithzaid.gazi/','Contact'), Spacer(1, 3*mm)]
story += [p('PROFILE','Section'), p('First-year Bachelor of Computer Applications student exploring software development, search engine optimization, and digital marketing. Curious, creative, and motivated to learn by building practical projects. Familiar with digital tools, AI-assisted research, content creation, and foundational SEO concepts.')]
story += [p('EDUCATION','Section')]
rows = [[p('Bachelor of Computer Applications (BCA)'),p('First year','MutedSmall')],[p('Senior Secondary Certificate (Class XII) - Commerce'),p('CBSE - 2026','MutedSmall')],[p('D.V. Public School, New Delhi','MutedSmall'),p('','MutedSmall')]]
t = Table(rows, colWidths=[118*mm,48*mm], hAlign='LEFT'); t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)])); story.append(t)
story += [p('DEVELOPMENT','Section'), p('Python (basic scripting and automation concepts) | HTML | CSS | C# | TypeScript'), p('Currently learning programming fundamentals, web structure, responsive styling, and practical problem solving.','MutedSmall')]
story += [p('SEO & DIGITAL MARKETING','Section'), p('SEO fundamentals | Keyword research | On-page optimization | Search intent | SERP analysis | Google Analytics | Content strategy | Campaign basics'), p('Self-assessed intermediate in SEO topics; continuing to learn digital marketing and measurement.','MutedSmall')]
story += [p('TOOLS & CREATIVE WORK','Section'), p('Canva | Microsoft Word, Excel, PowerPoint, Outlook, Teams, and OneNote | ChatGPT | Google Gemini | Claude'), p('Research, summarization, brainstorming, social media creatives, presentations, formatting, and visual communication.','MutedSmall')]
story += [p('PROJECT','Section'), p('<b>SOLD - How the Internet Learned to Sell You Yourself</b>'), p("An e-book and website exploring algorithms, consumer psychology, behavioral science, advertising, digital feeds, and purchasing behavior. <link href='https://growwithzaid.github.io/book/' color='#9b7522'>Visit the project</link>.")]
story += [p('LANGUAGES','Section'), p('English | Hindi')]
def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor('#d9d4c8')); canvas.line(19*mm,11*mm,A4[0]-19*mm,11*mm); canvas.setFont('Helvetica',7); canvas.setFillColor(muted); canvas.drawString(19*mm,7*mm,'ZAID AHMAD  |  CONTACT DETAILS UPDATED  |  RESIDENTIAL ADDRESS OMITTED'); canvas.restoreState()
SimpleDocTemplate(str(out), pagesize=A4, rightMargin=19*mm, leftMargin=19*mm, topMargin=15*mm, bottomMargin=16*mm, title='Zaid Ahmad - CV', author='Zaid Ahmad').build(story, onFirstPage=footer)
print(out)
