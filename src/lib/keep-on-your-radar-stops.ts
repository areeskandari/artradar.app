import { KEEP_ON_YOUR_RADAR } from '@/lib/keep-on-your-radar'

export type WalkStopImage = { src: string; alt: string }
export type WalkStopSection = { heading: string; paragraphs: string[] }
export type WalkStop = {
  slug: string
  name: string
  handle: string
  stopLabel: string | null
  exhibitionTitle: string
  description: string
  images: WalkStopImage[]
  sections: WalkStopSection[]
}

export const KEEP_ON_YOUR_RADAR_STOPS: WalkStop[] = [
  {
    "slug": "leila-heller-gallery",
    "name": "Leila Heller Gallery",
    "handle": "leilahellergallery",
    "stopLabel": "Meet here",
    "exhibitionTitle": "Current exhibitions",
    "description": "Leila Heller Gallery in Alserkal Avenue — the first stop on the Art Radar walk.",
    "images": [
      {
        "src": "/images/events/keep-on-your-radar/leila-heller-gallery-1.jpg",
        "alt": "Leila Heller Gallery, Alserkal Avenue"
      },
      {
        "src": "/images/events/keep-on-your-radar/leila-heller-gallery-2.jpg",
        "alt": "Works on view at Leila Heller Gallery"
      },
      {
        "src": "/images/events/keep-on-your-radar/leila-heller-gallery-3.jpg",
        "alt": "Exhibition view at Leila Heller Gallery"
      }
    ],
    "sections": [
      {
        "heading": "About Leila Heller Gallery",
        "paragraphs": [
          "Since its establishment four decades ago, Leila Heller has gained worldwide recognition as a pioneer in promoting creative dialogue and exchange between Western artists and Middle Eastern, Central and Southeast Asian artists. In 2010, Leila Heller moved from the Upper East Side to its flagship space, Leila Heller Gallery, in Chelsea where it has garnered a reputation for identifying and cultivating the careers of artists leaving a lasting impact on contemporary art and culture.",
          "In March of 2019, Leila Heller made her return to the Upper East Side after eight years. The New York space has since brought its focus back to the secondary market, and has hosted events such as Double Vision, curated by Jane Holzer and featuring works by Andy Warhol, Richard Prince, Jeff Koons, and Keith Haring, amongst others.",
          "In 2015, Leila Heller opened the Leila Heller Gallery in Dubai, its first international location in Dubai’s Alserkal Avenue. At 16,500 square feet and 32-foot ceilings, it is a state-of-the-art gallery that features three exhibition spaces, making it the largest gallery in the Middle East. Showcasing leading regional and international artists, many of whom will be presenting their work in the Middle East for the first time, the gallery is dedicated to supporting the evolving practice of established artists. The gallery has strong innovative curatorial and educational programs with an emphasis on promoting a dialogue between Western and Middle Eastern artists.",
          "In addition to presenting a dynamic exhibition schedule, Leila Heller Gallery actively organizes shows with world-renowned curators, hosts educational panels and film screenings, and produces catalogues and books with scholarly essays. Each year the gallery participates in major international art fairs and stages off-site projects as a platform for exploring new conversations within a wider context of galleries, artists and institutions. Gallery artists have consistently participated in international museum exhibitions and biennials, and are included in leading institutional collections worldwide."
        ]
      },
      {
        "heading": "About Azza Al Qubaisi",
        "paragraphs": [
          "Azza Al Qubaisi (b. 1978) is an Emirati artist, designer, and entrepreneur, recognized as the UAE’s first jewelery designer. Her work spans jewelery and sculpture, combining materials from gold and silver to palm fronds and rubber tires, and is deeply inspired by Emirati heritage, the desert landscape, and traditional crafts.",
          "Al Qubaisi’s practice reflects her commitment to sustainability, cultural preservation, and innovation, transforming simple, everyday materials into contemporary art. She holds a B.A. from London Guildhall University, a Diploma from Chelsea College of Arts, and an MA from HCT – CERT, Abu Dhabi. Her work is included in prominent collections such as Sheikh Mohamed Bin Zayed, Etihad Airline, Sharjah Islamic Art Festival, and Tashkeel Dubai."
        ]
      },
      {
        "heading": "About Manish Nai",
        "paragraphs": [
          "Manish Nai (b. 1980, Gujarat, India) received a Diploma in Drawing and Painting from the L. S. Raheja School of Art in Mumbai. Working with materials that are both modest and distinctly Indian—such as jute, newspaper, used clothes, old books, and found or rusted corrugated metal sheets—Nai compresses, reshapes and reconfigures them into sculptural and pictorial forms. His practice highlights transformation, where the material’s history and memory are preserved while its form becomes entirely new.",
          "Nai has exhibited internationally at institutions including Devi Art Foundation, New Delhi; Bhau Daji Lad Museum, Mumbai; Para Site, Hong Kong; Museum of Modern Art, Warsaw; NTU CCA, Singapore; Het Noordbrabants Museum, Netherlands; and the Smart Museum of Art, Chicago. He has participated in the Kochi-Muziris Biennale (2014, 2018) and the Shanghai Biennale (2012). His solo exhibitions include Richard Taittinger Gallery, New York; Galerie Karsten Greve, Paris and St. Moritz; Kavi Gupta, Chicago; Galerie Mirchandani + Steinruecke, Mumbai; and Nature Morte. In 2017, Fondation Fernet-Branca in Saint-Louis, France, presented a comprehensive exhibition of his paintings, murals, sculptures and photographs."
        ]
      },
      {
        "heading": "About Karima Al Shomely",
        "paragraphs": [
          "Dr. Karima is an artist, visual researcher, and educator. Her prints, photographs, paintings, and installations have been featured in many important exhibitions both in the UAE and internationally. Recent exhibitions include “Buqshe”, University of Exeter, UK (2025); “Their Stories” at ECC, Venice, Italy (2024); and “Sahhara Hidden Adornments” at Maraya Art Centre, Sharjah (2022). Al Shomely exhibited in numerous international venues including Expo 2020 Dubai, Saudi Arabia, Paris, Berlin, Houston, London, New York, Seoul and Bonn. Awards included First Place in Sultan Al-Owais Award, 2018, 2005, 2002; Prize from 5th Egyptian International Print Triennial, Cairo, 2006; and Second prize, Sharjah International Art Biennial, Installation Category, 2001. Her research focuses on Islamic geometry and heritage iconography of Emirati Women."
        ]
      }
    ]
  },
  {
    "slug": "the-third-line",
    "name": "The Third Line Gallery",
    "handle": "thethirdlinedxb",
    "stopLabel": null,
    "exhibitionTitle": "Taking Form — Rana Begum",
    "description": "Rana Begum’s fifth solo exhibition at The Third Line, on the Art Radar walk through Alserkal Avenue.",
    "images": [
      {
        "src": "/images/events/keep-on-your-radar/the-third-line.jpg",
        "alt": "Taking Form by Rana Begum at The Third Line"
      }
    ],
    "sections": [
      {
        "heading": "About The Third Line",
        "paragraphs": [
          "Founded in 2005, The Third Line is a Dubai-based gallery that represents contemporary artists locally, regionally, and internationally. With 20 years of dedicated commitment to the arts, it has become a pioneering platform for established talent and emerging voices from the region and its diaspora. Through a dynamic program encompassing exhibitions, artist talks, and art book publishing, The Third Line fosters rich discourse around contemporary art practices from the region.",
          "Represented artists include: Abbas Akhavan, Ala Ebtekar, Amir H. Fallah, Anuar Khalifi, Bady Dalloul, Farah Al Qasimi, Farhad Moshiri, Fouad Elkoury, Hassan Hajjaj, Hayv Kahraman, Huda Lutfi, Joana Hadjithomas & Khalil Joreige, Jordan Nassar, Kamran Samimi, Laleh Khorramian, Lamya Gargash, Monir Shahroudy Farmanfarmaian, Nima Nabavi, Pouran Jinchi, Rana Begum, Sahand Hesamiyan, Sara Naim, Sarah Awad, Shirin Aliabadi, Slavs and Tatars, Sophia Al-Maria, Tarek Al-Ghoussein, Vian Sora, yasiin bey, and Youssef Nabil."
        ]
      },
      {
        "heading": "About the exhibition",
        "paragraphs": [
          "The Third Line is pleased to present Rana Begum’s fifth solo exhibition at the gallery, featuring a new body of works across linen, textile, wood, and paper. The exhibition continues Begum’s exploration of textiles, bringing the medium into dialogue with her ongoing interest in light, color, and material. While embracing a turn towards softness and delicacy, the works in Taking Form build on Begum's longstanding engagement with abstraction and Minimalism, continuing her exploration of light through new materials and forms. This engagement with geometry runs throughout: forms suggest patterns that extend beyond their physical boundaries. Drawing on Islamic geometry, the square and rectangle establish defined perimeters, while the configurations within them suggest a sense of continuation. The geometry is never truly contained.",
          "Begum moves fluidly across various media such as metal, paper, wood, terracotta, and mesh. Her latest work with wool, creating large-scale tapestries, is a testament to this versatility. Suspended from the ceiling in Gallery 1, Begum’s nearly five-meter-tall tapestries draw the viewer’s gaze upwards, transforming the gallery into a vast, immersive field of cascading color. Begum’s interest in woven surfaces dates back to 2022, when she was commissioned to design seat covers and tapestries as part of the Bristol Beacon’s transformation project. Her collaboration with the textile studio Dash & Miller for the project has continued through the large-scale tapestries in Taking Form, exploring how material, color, and scale come together to create a sense of expansion within the gallery space. The tapestries are composed of colored triangles, drawing on the geometric abstraction that characterizes Begum’s visual language. These colors are not just layered but woven together using the ridging technique, resulting in a dual pattern that is revealed only as the viewer moves around them.",
          "Adjacent to the monumental tapestries, the paper works are studies of color interaction, using watercolor marks to explore how hues respond to one another. Their pale, aqueous tones echo the labor-intensive process of combining colors in the tapestries, distilled here into just a few strokes and creating a visual link between the two rooms.",
          "Begum continues her exploration of textiles through a series of large-scale linen paintings in Gallery 2. These works extend her longstanding interest in how paint interacts with different surfaces, from reflective mirror and glass to more absorbent materials such as wood, paper, and canvas. Here, this structure, particularly the use of overlapping triangles, is translated onto linen through layers of diluted acrylic paint. The natural, unprocessed tone and texture of the linen influence the color as it is absorbed into the weave, creating a sense of rawness and an organic quality across the surface. The resulting interplay of paint and linen allows the works to evoke the shifting qualities of light through color. Alongside the linens, a set of wooden panel paintings punctuate the space with playful accents through their smaller scale and subtle shifts in color. Though the colors themselves are light, they build upon one another, creating changes in density as more layers accumulate. The smooth surface of the wooden panels holds the paint differently, allowing for a more consistent veil of color across the surface. Together, both series create a luminous field across the gallery, with a gentle rhythm that shifts as the viewer moves through the space.",
          "Begum has explored light throughout her practice, considering the shifting sensory effects it produces through different combinations of color, material, and scale. The works in Taking Form continue this exploration, inviting viewers to move through the galleries at their own pace and discover changing hues, forms, and rhythms along the way."
        ]
      },
      {
        "heading": "About the artist — Rana Begum",
        "paragraphs": [
          "Rana Begum’s (b. 1977, Sylhet, Bangladesh; lives/ works: London, UK) work focuses on the interplay between light and color, blurring the boundaries between sculpture, painting and architecture. Her visual language draws from the urban landscape as well as geometric patterns from traditional Islamic art and architecture. Light is fundamental to her process. Her work moves across a wide range of media—from metal, glass, and stone to paper, wood, and textiles—each absorbing or reflecting light to produce an experience that is at once temporal and sensorial.",
          "Begum holds a BA in Fine Art from Chelsea College of Art and Design and an MFA in Painting from the Slade School of Fine Art. Her first museum solo exhibition Space Light Colour opened at the Sainsbury Centre for Visual Arts in May 2017 and traveled to Djanogly Gallery in Nottingham, UK in July 2018. Other solo exhibitions include: Boundless Geometry, The Farjam Collection, Dubai, UAE (2026); Reflection, SCAD Museum of Art, GA, USA (2025); Ordered Form, St Albans Museum + Gallery, UK (2023); Dappled Light, The Box, Plymouth, UK (2023); Infinite Geometry, Wanås Konst, The Wanås Foundation, Sweden (2021); Dhaka Art Summit, Bangladesh (2014 and 2020); Perception and Reflection, The Third Line, Dubai, UAE (2019); A Conversation with Light and Form, Tate St Ives, Cornwall, UK (2018); The Space Between, Parasol Unit, London, UK (2016); and New Works, Delfina Foundation, London, UK (2010)"
        ]
      }
    ]
  },
  {
    "slug": "ishara-art-foundation",
    "name": "Ishara Art Foundation",
    "handle": "isharaartfoundation",
    "stopLabel": null,
    "exhibitionTitle": "The sky held it, the earth remembered",
    "description": "The sky held it, the earth remembered at Ishara Art Foundation, a stop on the Art Radar walk.",
    "images": [
      {
        "src": "/images/events/keep-on-your-radar/ishara-art-foundation.jpg",
        "alt": "The sky held it, the earth remembered at Ishara Art Foundation"
      }
    ],
    "sections": [
      {
        "heading": "About Ishara Art Foundation",
        "paragraphs": [
          "Ishara Art Foundation was founded in 2019 as a non-profit organisation dedicated to presenting contemporary art of South Asia. Located in Dubai, the Foundation supports emerging and established practices that advance critical dialogue and explore global interconnections.",
          "Guided by a research-led approach, Ishara realises its mission through exhibitions, onsite and online programmes, education initiatives and collaborations in the UAE and internationally. The Foundation facilitates exchange between South Asian and international artistic networks that include museums, foundations, institutions, galleries and individuals."
        ]
      },
      {
        "heading": "About the exhibition",
        "paragraphs": [
          "Ishara Art Foundation presents The sky held it, the earth remembered in collaboration with the Han Nefkens Foundation, an exhibition that showcases major works by Shahana Rajani, the recipient of the inaugural South Asian Video Art Production Grant, Rohini Devasher, and Sarker Protick.",
          "The exhibition examines how land, water, and the cosmos serve as living archives of memory and history. Through photography, moving image, and installation, the exhibition proposes that the environment bears the material traces of ecological change, preserving them across deep time.",
          "The sky held it, the earth remembered engages with contemporary critiques of the Anthropocene, rejecting a human-centred vision of the world in favour of the view that people and non-human forces are irrevocably intertwined. Rather than a passive witness to history, the earth embodies the effects of environmental destruction and infrastructural violence.",
          "These traces are inscribed on the environment as residues and stratified layers that often elude human perception. Dense urban infrastructure belies the vegetation that preceded it, and which now fills only liminal spaces; the banks of the Indus River, erased by flooding, turn into brushstrokes on a mural painted from memory; and celestial phenomena become repositories of information invisible to the naked eye.",
          "In Shahana Rajani’s Lines That World a River, the Indus emerges as a site of extraction, erasure and contested memory. The three-channel film traces the experiences of displaced communities of the delta who create murals and paintings to reconstruct and memorialise their ancestral villages, submerged underwater due to the building of hydraulic dams and barrages. An enclosure evoking a dargah – often the only structures that remain standing amid inundated settlements – sits in the centre of the three screens.",
          "Rohini Devasher’s Latent Fields consists of three monumental habotai silk panels suspended from the ceiling, each measuring 3 x 5.5 metres. The works are emblazoned with images inspired by sun spots and other solar phenomena, shifting in scale from the microscopic to the atmospheric, as though taking the viewer through the body of a star. To create the images, she draws on specialised technologies used to observe distant stars and subatomic particles. Layered with these luminous forms and delicate tracings, the installation represents the atmosphere as a palimpsest of cosmic time.",
          "A selection from Sarker Protick’s Dhaka 1217, a recent series of 135 black-and-white photographs, is displayed at Ishara. The complete body of work forms the basis of a forthcoming book of the same title (co-published by Nokta Books and Sarker Protick, Autumn 2026). Captured between 2011 and 2026, the works document the transformation of a one-square-mile radius around the neighbourhood where the artist was born and continues to live. These scenes position the city of Dhaka as a contested terrain in which social, ecological and individual histories converge.",
          "Bringing together perspectives from Pakistan, India, and Bangladesh, The sky held it, the earth remembered foregrounds shared experiences of ecological decline, revealing how rivers, landscapes, and skies testify to changes that transcend national borders. Rather than offering a definitive historical account, the exhibition invites sustained and close attentiveness to subtle traces that narrate stories of both dispossession and resilience, for those who are willing to hear them.",
          "Artworks for The sky held it, the earth remembered have been loaned from Gallery Wendi Norris, San Francisco and Shrine Empire, New Delhi.",
          "The Han Nefkens Foundation – South Asian Video Art Production Grant 2023 in collaboration with Prameya Art Foundation, New Delhi, is presented in partnership with Ishara Art Foundation, Dubai; Nottingham Contemporary; Museum of Contemporary Art Tokyo (MOT); Museum of Contemporary Art Antwerp (M HKA); and Para Site, Hong Kong."
        ]
      }
    ]
  },
  {
    "slug": "firetti-contemporary",
    "name": "Firetti Contemporary",
    "handle": "firetticontemporary",
    "stopLabel": null,
    "exhibitionTitle": "Ahmad Tallaa",
    "description": "Ahmad Tallaa at Firetti Contemporary, a stop on the Art Radar walk through Alserkal Avenue.",
    "images": [
      {
        "src": "/images/events/keep-on-your-radar/firetti-contemporary.jpg",
        "alt": "Works by Ahmad Tallaa at Firetti Contemporary"
      }
    ],
    "sections": [
      {
        "heading": "About Firetti Contemporary",
        "paragraphs": [
          "Firetti Contemporary is a Dubai-based contemporary art gallery presenting a multidisciplinary program of regional and international artists working across painting, sculpture, installation, and mixed media.",
          "Through exhibitions, public projects, institutional collaborations, and art fair presentations, the gallery supports both emerging and established practices, with a particular focus on artists from the UAE and the wider region. Its program brings together artists whose works engage with memory, identity, materiality, landscape, and contemporary cultural narratives across local and global contexts.",
          "Founded by Mara Firetti and co-founded by Celine Azem, Firetti Contemporary continues to develop a collaborative and research-driven program grounded in long-term artist support, curatorial exchange, and cross-cultural dialogue."
        ]
      },
      {
        "heading": "About the artist — Ahmad Tallaa",
        "paragraphs": [
          "Ahmad Tallaa (b. 1994, Damascus, Syria; lives and works in Sharjah, UAE) is a multidisciplinary artist working across painting, sculpture, printmaking, handmade paper, and material fabrication. He studied at the Faculty of Fine Arts, Damascus (2012–2017), and received the Spring Annual Exhibition Award from the Syrian Ministry of Culture for Best Artwork in both 2017 and 2019.",
          "Tallaa's practice is rooted in the physical act of making — he fabricates many of his own tools and materials, treating the studio process as a form of inquiry rather than production. His works bear visible evidence of this: layered surfaces eroded and rebuilt, forms that hover between emergence and disappearance, compositions shaped by pressure, time, and material resistance. He approaches each work not with a predetermined image in mind, but through sustained observation — allowing forms to surface from the material itself.",
          "Central to his work is the experience of living under the shadow of conflict. The instability, displacement, and sensory texture of wartime Damascus have left a deep imprint on his visual language: surfaces that recall rubble and ruin, figures that dissolve before they can fully cohere, marks that speak of both presence and erasure.",
          "This sensibility extends beyond his visual practice. Tallaa also crafts musical instruments by hand, among them the ney, a traditional reed flute, and plays both ney and oud. For him, music and visual art share the same impulse: a need for expression that no single medium can fully contain."
        ]
      }
    ]
  },
  {
    "slug": "efie-gallery",
    "name": "Efie Gallery",
    "handle": "efiegallery",
    "stopLabel": "Last stop",
    "exhibitionTitle": "Maggie Otieno",
    "description": "Maggie Otieno’s first solo exhibition at Efie Gallery, the last stop on the Art Radar walk.",
    "images": [
      {
        "src": "/images/events/keep-on-your-radar/efie-gallery.jpg",
        "alt": "Maggie Otieno at Efie Gallery"
      }
    ],
    "sections": [
      {
        "heading": "About the exhibition",
        "paragraphs": [
          "There are artists who impose themselves upon material, and there are artists who listen. Maggie Otieno belongs decisively to the latter. Her practice emerges from attentiveness rather than imposition. Wood is not forced into submission and metal is not bent into silence; instead each fragment of matter is approached as a bearer of memory — already marked, already shaped by time, already carrying histories that precede the sculptor’s intervention. Maggie’s work begins by recognising that materials remember.",
          "This first solo exhibition marks the public articulation of a philosophy that has matured quietly through years of practice. The sculptures presented here are not simply assembled objects. They are encounters with material histories: railway sleepers weathered by time, distressed timbers bearing the marks of labour and environment, fragments of metal tools, joinery bolts, spanners and structural elements drawn from the lived world of work and infrastructure.",
          "In Maggie’s hands these materials are not inert components. They remain active participants in the sculptural conversation. At the centre of this exhibition is the railway sleeper. Within the East African landscape the sleeper carries a particular historical gravity. It is an object bound to the physical expansion of railway infrastructure and the movement of people, goods and labour across territories. Beneath locomotives these beams absorbed immense pressure.",
          "They carried vibration, heat and weight for decades, often without recognition. Maggie approaches these materials not as remnants of industry but as witnesses. Their endurance becomes part of the sculptural language. The surfaces of the sleepers retain their histories. Bolt holes remain visible, cracks are preserved, and weathering is allowed to speak. The grain of the wood becomes a record of experience. Rather than concealing these marks, Maggie positions them at the centre of the composition.",
          "Fractures become lines of structure. Splits open subtle emotional spaces within the form. The timber itself reads almost like a map — a topography of endurance shaped by time, labour and environment. Distressed materials are fundamental to Maggie’s process. Instead of seeking pristine surfaces she actively hunts for fragments that have lived. Weathered timber, oxidised metal tools, structural bolts and worn fastenings are drawn into her sculptural vocabulary.",
          "These materials appear almost to gravitate toward her practice, each carrying traces of its earlier life. Maggie’s role becomes one of recognition: identifying which materials resonate with the evolving language of her work and allowing them to find new form. Within this process the sculptures begin to behave almost as travellers through time. Each work carries fragments of earlier histories while inhabiting a distinctly contemporary sculptural presence.",
          "The past is not reconstructed literally but communicated subliminally through material presence. The works possess a contemporised spirit: they remain grounded in nature and history while existing fully within the present moment. Earlier phases of Maggie’s practice reveal the development of this sensibility. Her early explorations in jacaranda wood established an intimate relationship with organic material. Carved surfaces emphasised tactile sensitivity and the expressive potential of natural grain.",
          "These early works demonstrated an emerging attentiveness to the way material itself communicates form and feeling. The introduction of metal into her practice expanded this vocabulary. Metal introduced density, resistance and structural tension, allowing Maggie to explore weight and balance in new ways. During her time at Kuona Trust in Kilimani the dialogue between wood and metal became central to her sculptural thinking.",
          "Organic material and industrial material began to interact within the same works, reflecting the intertwined realities of nature and human activity. Another significant chapter in Maggie’s evolution emerged during the COVID period. During this time she produced a series of fragile coloured aluminium sheet sculptures that functioned as detailed studies. These works explored gesture and posture through a refined sculptural language.",
          "Often simplified to essential forms, the creations communicated emotional presence without relying on multiple features. These aluminium works can be understood as exercises in reflection and sculptural expressionism. Their delicacy emphasised sensitivity to form and emotional nuance. Each piece operated almost like a quiet meditation on aspects feminine. The coloured aluminium surfaces introduced lightness and subtle tonal variation while maintaining structural clarity.",
          "When viewed in relation to the sleeper sculptures, these aluminium studies reveal a deeper continuity. Both bodies of work explore how form communicates internal states. In the aluminium pieces this occurs through delicate form and purposeful abstraction; in the sleeper sculptures the same sensitivity emerges through weight, balance and the silent authority of material presence. The shift is not conceptual but material — an expansion from intimate study to monumental memory.",
          "A defining moment in Maggie’s engagement with railway sleepers occurred through her encounter with the late Mr. Chandu Dodia, who supplied many of the materials she now works with. During a visit to his furniture workshop he expressed a simple yet profound insight. While he could transform the sleepers into furniture, he recognised that an artist could reveal the deeper stories embedded within the wood. He encouraged Maggie to give the material a voice. This moment reframed Maggie’s relationship with the sleepers.",
          "They were no longer merely reclaimed timber but entrusted histories. The sculptor’s task became one of listening carefully to what the material already contained. Through composition and balance Maggie began to reveal those narratives — not through literal illustration but through presence. Trust therefore becomes a quiet thread throughout the exhibition. Trust in material. Trust in process. Trust that certain fragments will resonate with the artist and naturally find their place within a work.",
          "The sculptures emerge through careful selection and intuitiveassembly. Materials grounded in nature — wood, metal and tools shaped by labour — are brought together in ways that feel both deliberate and inevitable. The resulting works possess an energy that feels almost predestined. Once assembled they project a subtle but unmistakable presence. Collectors and viewers frequently respond to these sculptures with a sense of recognition rather than surprise.",
          "The works feel discovered rather than invented, as though the materials themselves had been waiting to assume this configuration."
        ]
      },
      {
        "heading": "About the artist — Maggie Otieno",
        "paragraphs": [
          "Based in Nairobi, Otieno initially trained as a painter, joining the Kuna Trust Art Centre in 1996, where her encounter with sculptor Elijah Ogira catalysed a decisive shift toward three-dimensional forms. Captivated by the tactile and expressive potential of sculpture, she soon committed fully to the medium, embarking on a self-guided artistic journey that eschewed formal academic instruction in favour of intuition, curiosity, and relentless experimentation.",
          "Otieno’s early practice was marked by a distinct engagement with stone and wood as discrete materials. Over time, her sculptural vocabulary has evolved to incorporate found objects—most notably weathered wood and rusted metal—fused into totemic compositions that explore the endurance of memory and the resilience of the human spirit. Her signature works, often constructed from century-old railway sleepers, manifest as elongated abstracted figures that straddle figuration and symbolism.",
          "These forms, at once solemn and lyrical, evoke states of movement, vulnerability, and communal presence, offering subtle yet poignant reflections on identity, history, and place.",
          "In 2023, Otieno was selected to participate in The Anthropocene Museum 9.0: The Old Sharjah Slaughterhouse Tour, an exhibition by Cave_bureau curated by Tosin Oshinowo for the Sharjah Architecture Triennial. Her inclusion in this context underscores her growing recognition as a vital artistic voice interrogating postcolonial spatial histories and environmental legacies through sculptural practice."
        ]
      }
    ]
  }
]

export function getWalkStop(slug: string) {
  return KEEP_ON_YOUR_RADAR_STOPS.find((stop) => stop.slug === slug)
}

export function walkStopPath(slug: string) {
  return `/events/${KEEP_ON_YOUR_RADAR.slug}/${slug}`
}
