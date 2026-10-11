"""Optional Pillow regeneration; normal builds use reviewed derivatives only."""
from pathlib import Path
from PIL import Image
assets = Path(__file__).resolve().parent.parent / 'public/assets'
logo = Image.open(assets / 'HB Monogram.png').crop((400, 180, 1140, 880))
logo.resize((296, 280), Image.Resampling.LANCZOS).save(assets / 'hb-monogram-cropped.png', optimize=True)
files = [
 ('projects/cyberquiz-pro/cyberquiz-pro.png', 'cyberquiz-pro', 1400),
 ('projects/cyberquiz-pro/Cyber_Hosna.jpeg', 'cyberquiz-expo', 1000),
 ('projects/cyberquiz-pro/Cyber_Team.jpeg', 'cyberquiz-team', 1400),
 ('projects/cyberquiz-pro/WinnerPic_CyberquizPro.jpeg', 'cyberquiz-award', 1400),
 ('projects/cyberquiz-pro/HA Begum.png', 'cyberquiz-certificate', 1888),
 ('projects/tas_energy/TasEnergy_1.png', 'tasenergy-1', 1600),
 ('projects/tas_energy/TasEnergy_2.png', 'tasenergy-2', 1600),
]
for source, name, size in files:
 image = Image.open(assets / source).convert('RGB')
 image.thumbnail((size, size), Image.Resampling.LANCZOS)
 image.save(assets / 'selected' / (name + '.jpg'), quality=90, optimize=True)
 print(name, image.size)
