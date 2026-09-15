const { SlashCommandBuilder, ContainerBuilder, MediaGalleryItemBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { getSudoku } = require('sudoku-gen');
const path = require('path');
const Canvas = require('canvas');
const fs = require('fs');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const userConfData = require("../../../models/configData");
const { themeRegistry } = require('../../../utils/themeConfig');
const { getAvailableThemes } = require('../../../utils/themeAccess');

const fonts = [
  { file: 'Chatlong.otf', family: 'Chatlong' },
  { file: 'Chewy-Regular.ttf', family: 'Chewy Regular' },
  { file: 'Dinofiles.otf', family: 'Dinofiles' },
  { file: 'MTF Chubb.ttf', family: 'MTF Chubb' },
  { file: 'NightBlood.ttf', family: 'NightBlood' },
  { file: 'Onion.otf', family: 'Onion' },
  { file: 'RandomThought.ttf', family: 'RandomThought' },
  { file: 'Rubik-Bold.ttf', family: 'Rubik Bold' },
  { file: 'Sniglet-Regular.ttf', family: 'Sniglet' },
];

fonts.forEach(font => {
  Canvas.registerFont(path.join(__dirname, '..', '..', 'fonts', font.file), { family: font.family });
});

const emojiThemes = {
  default: {
    buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    canvas: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  toastie: {
    buttons: [
      { name: 'toastie1', id: '1384614836432015420' },
      { name: 'toastie2', id: '1384614838143025222' },
      { name: 'toastie3', id: '1384614840185655467' },
      { name: 'toastie4', id: '1384614841481953421' },
      { name: 'toastie5', id: '1384614843046301696' },
      { name: 'toastie6', id: '1384614844279427132' },
      { name: 'toastie7', id: '1384614846137368759' },
      { name: 'toastie8', id: '1384614847588601999' },
      { name: 'toastie9', id: '1384614849752862790' },
    ],
    canvas: ['toastie1', 'toastie2', 'toastie3', 'toastie4', 'toastie5', 'toastie6', 'toastie7', 'toastie8', 'toastie9'],
  },
  colorblind: {
    buttons: [
      { name: 'cb1', id: '1384614887283622068' },
      { name: 'cb2', id: '1384614888457900195' },
      { name: 'cb3', id: '1384614890903310458' },
      { name: 'cb4', id: '1384614892241162413' },
      { name: 'cb5', id: '1384614893704974427' },
      { name: 'cb6', id: '1384614895223308461' },
      { name: 'cb7', id: '1384614896657891409' },
      { name: 'cb8', id: '1384614902911471636' },
      { name: 'cb9', id: '1384614904463364247' },
    ],
    canvas: ['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6', 'cb7', 'cb8', 'cb9'],
  },
  faces: {
    buttons: [
      { name: 'f1', id: '1384616172078759996' },
      { name: 'f2', id: '1384616173580320878' },
      { name: 'f3', id: '1384616175161573548' },
      { name: 'f4', id: '1384616177032233060' },
      { name: 'f5', id: '1384616178726735992' },
      { name: 'f6', id: '1384616180547059803' },
      { name: 'f7', id: '1384616183126429847' },
      { name: 'f8', id: '1384616185123049744' },
      { name: 'f9', id: '1384616186645319692' },
    ],
    canvas: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9'],
  },
  transport: {
    buttons: [
      { name: 't1', id: '1384615921204592843' },
      { name: 't2', id: '1384615923176050808' },
      { name: 't3', id: '1384615925235580998' },
      { name: 't4', id: '1384615927391457330' },
      { name: 't5', id: '1384615928813060148' },
      { name: 't6', id: '1384615931682099232' },
      { name: 't7', id: '1384615933217341581' },
      { name: 't8', id: '1384615935159308339' },
      { name: 't9', id: '1384615936962728067' },
    ],
    canvas: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'],
  },
  animals: {
    buttons: [
      { name: 'a1', id: '1384619444759826682' },
      { name: 'a2', id: '1384619446273839154' },
      { name: 'a3', id: '1384619447599497317' },
      { name: 'a4', id: '1384619449239212186' },
      { name: 'a5', id: '1384619450707349584' },
      { name: 'a6', id: '1384619452028551218' },
      { name: 'a7', id: '1384619453429579886' },
      { name: 'a8', id: '1384619454809505832' },
      { name: 'a9', id: '1384619456919109874' },
    ],
    canvas: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'],
  },

  bread: {
    buttons: [
      { name: 'bread1', id: '1501452370704601169' },
      { name: 'bread2', id: '1501452371882934382' },
      { name: 'bread3', id: '1501452372977651742' },
      { name: 'bread4', id: '1501452374517223434' },
      { name: 'bread5', id: '1501452375922180187' },
      { name: 'bread6', id: '1501452377251643392' },
      { name: 'bread7', id: '1501452378589892700' },
      { name: 'bread8', id: '1501452379713835081' },
      { name: 'bread9', id: '1501452381156671578' },
    ],
    canvas: ['bread1', 'bread2', 'bread3', 'bread4', 'bread5', 'bread6', 'bread7', 'bread8', 'bread9'],
  },
  bulbasaur: {
    buttons: [
      { name: 'bulb1', id: '1501348630211068104' },
      { name: 'bulb2', id: '1501348631519821905' },
      { name: 'bulb3', id: '1501348632815993042' },
      { name: 'bulb4', id: '1501348634174951644' },
      { name: 'bulb5', id: '1501348634992574618' },
      { name: 'bulb6', id: '1501348636515111143' },
      { name: 'bulb7', id: '1501348637559488545' },
      { name: 'bulb8', id: '1501348638742413372' },
      { name: 'bulb9', id: '1501348639946051695' },
    ],
    canvas: ['bulb1', 'bulb2', 'bulb3', 'bulb4', 'bulb5', 'bulb6', 'bulb7', 'bulb8', 'bulb9'],
  },
  ico: {
    buttons: [
      { name: 'ico1', id: '1501453576336314448' },
      { name: 'ico2', id: '1501453577497874572' },
      { name: 'ico3', id: '1501453579142041692' },
      { name: 'ico4', id: '1501453580224434186' },
      { name: 'ico5', id: '1501453581491109999' },
      { name: 'ico6', id: '1501453582820577340' },
      { name: 'ico7', id: '1501453584070606898' },
      { name: 'ico8', id: '1501453585378971809' },
      { name: 'ico9', id: '1501453587249893427' },
    ],
    canvas: ['ico1', 'ico2', 'ico3', 'ico4', 'ico5', 'ico6', 'ico7', 'ico8', 'ico9'],
  },
  icon: {
    buttons: [
      { name: 'icon1', id: '1501453616446181376' },
      { name: 'icon2', id: '1501453617649942659' },
      { name: 'icon3', id: '1501453618715426866' },
      { name: 'icon4', id: '1501453619902414848' },
      { name: 'icon5', id: '1501453621080883322' },
      { name: 'icon6', id: '1501453622490300506' },
      { name: 'icon7', id: '1501453623841001593' },
      { name: 'icon8', id: '1501453625350684803' },
      { name: 'icon9', id: '1501453626357579806' },
    ],
    canvas: ['icon1', 'icon2', 'icon3', 'icon4', 'icon5', 'icon6', 'icon7', 'icon8', 'icon9'],
  },
  nfr: {
    buttons: [
      { name: 'nfr1', id: '1501454106152140902' },
      { name: 'nfr2', id: '1501454107607568395' },
      { name: 'nfr3', id: '1501454108819849236' },
      { name: 'nfr4', id: '1501454109918761110' },
      { name: 'nfr5', id: '1501454111294492732' },
      { name: 'nfr6', id: '1501454112586334258' },
      { name: 'nfr7', id: '1501454114234830920' },
      { name: 'nfr8', id: '1501454115644113007' },
      { name: 'nfr9', id: '1501454116725981274' },
    ],
    canvas: ['nfr1', 'nfr2', 'nfr3', 'nfr4', 'nfr5', 'nfr6', 'nfr7', 'nfr8', 'nfr9'],
  },
  nlogo: {
    buttons: [
      { name: 'nlogo1', id: '1501454138393755829' },
      { name: 'nlogo2', id: '1501454139677212702' },
      { name: 'nlogo3', id: '1501454140834840717' },
      { name: 'nlogo4', id: '1501454143041179678' },
      { name: 'nlogo5', id: '1501454144190414858' },
      { name: 'nlogo6', id: '1501454145406898236' },
      { name: 'nlogo7', id: '1501454146686029975' },
      { name: 'nlogo8', id: '1501454148313419856' },
      { name: 'nlogo9', id: '1501454149810786415' },
    ],
    canvas: ['nlogo1', 'nlogo2', 'nlogo3', 'nlogo4', 'nlogo5', 'nlogo6', 'nlogo7', 'nlogo8', 'nlogo9'],
  },
  nmisc: {
    buttons: [
      { name: 'nmisc1', id: '1501454503311052933' },
      { name: 'nmisc2', id: '1501454504564883557' },
      { name: 'nmisc3', id: '1501454505655533598' },
      { name: 'nmisc4', id: '1501454507111092336' },
      { name: 'nmisc5', id: '1501454508260065300' },
      { name: 'nmisc6', id: '1501454510097301525' },
      { name: 'nmisc7', id: '1501454512194584616' },
      { name: 'nmisc8', id: '1501454513880436827' },
      { name: 'nmisc9', id: '1501454515545571419' },
    ],
    canvas: ['nmisc1', 'nmisc2', 'nmisc3', 'nmisc4', 'nmisc5', 'nmisc6', 'nmisc7', 'nmisc8', 'nmisc9'],
  },
  pikachu: {
    buttons: [
      { name: 'pika1', id: '1501348660431032410' },
      { name: 'pika2', id: '1501348661802569960' },
      { name: 'pika3', id: '1501348662968713457' },
      { name: 'pika4', id: '1501348665263128776' },
      { name: 'pika5', id: '1501348666802438187' },
      { name: 'pika6', id: '1501348668589215924' },
      { name: 'pika7', id: '1501348669897576559' },
      { name: 'pika8', id: '1501348671206461590' },
      { name: 'pika9', id: '1501348672447713371' },
    ],
    canvas: ['pika1', 'pika2', 'pika3', 'pika4', 'pika5', 'pika6', 'pika7', 'pika8', 'pika9'],
  },
  star: {
    buttons: [
      { name: 'star1', id: '1501454539067232316' },
      { name: 'star2', id: '1501454540652675112' },
      { name: 'star3', id: '1501454542338916483' },
      { name: 'star4', id: '1501454543735754752' },
      { name: 'star5', id: '1501454545388175432' },
      { name: 'star6', id: '1501454547103780926' },
      { name: 'star7', id: '1501454548370456636' },
      { name: 'star8', id: '1501454549423231036' },
      { name: 'star9', id: '1501454550941438002' },
    ],
    canvas: ['star1', 'star2', 'star3', 'star4', 'star5', 'star6', 'star7', 'star8', 'star9'],
  },

  ac: {
    buttons: [
      { name: 'ac1', id: '1501455204825170001' },
      { name: 'ac2', id: '1501455206368546867' },
      { name: 'ac3', id: '1501455207425507359' },
      { name: 'ac4', id: '1501455208197394443' },
      { name: 'ac5', id: '1501455209790967860' },
      { name: 'ac6', id: '1501455212366401598' },
      { name: 'ac7', id: '1501455213696122950' },
      { name: 'ac8', id: '1501455215063334972' },
      { name: 'ac9', id: '1501455215935881288' },
    ],
    canvas: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6', 'ac7', 'ac8', 'ac9'],
  },
  acn: {
    buttons: [
      { name: 'acn1', id: '1501455251390201866' },
      { name: 'acn2', id: '1501455252656750673' },
      { name: 'acn3', id: '1501455253805993984' },
      { name: 'acn4', id: '1501455255278325891' },
      { name: 'acn5', id: '1501455256771366963' },
      { name: 'acn6', id: '1501455259770425405' },
      { name: 'acn7', id: '1501455261037232188' },
      { name: 'acn8', id: '1501455262244933664' },
      { name: 'acn9', id: '1501455263423791175' },
    ],
    canvas: ['acn1', 'acn2', 'acn3', 'acn4', 'acn5', 'acn6', 'acn7', 'acn8', 'acn9'],
  },
  acnh: {
    buttons: [
      { name: 'acnh1', id: '1501455919286845481' },
      { name: 'acnh2', id: '1501455920469901322' },
      { name: 'acnh3', id: '1501455921581396151' },
      { name: 'acnh4', id: '1501455922768253058' },
      { name: 'acnh5', id: '1501455924076875871' },
      { name: 'acnh6', id: '1501455926249394317' },
      { name: 'acnh7', id: '1501455927679647856' },
      { name: 'acnh8', id: '1501455928854319184' },
      { name: 'acnh9', id: '1501455930707935272' },
    ],
    canvas: ['acnh1', 'acnh2', 'acnh3', 'acnh4', 'acnh5', 'acnh6', 'acnh7', 'acnh8', 'acnh9'],
  },
  badge: {
    buttons: [
      { name: 'badge1', id: '1501348588796776599' },
      { name: 'badge2', id: '1501348590159790080' },
      { name: 'badge3', id: '1501348591497646261' },
      { name: 'badge4', id: '1501348592714252320' },
      { name: 'badge5', id: '1501348594240847902' },
      { name: 'badge6', id: '1501348595130040474' },
      { name: 'badge7', id: '1501348596304580820' },
      { name: 'badge8', id: '1501348596908425348' },
      { name: 'badge9', id: '1501348598661779657' },
    ],
    canvas: ['badge1', 'badge2', 'badge3', 'badge4', 'badge5', 'badge6', 'badge7', 'badge8', 'badge9'],
  },
  blox: {
    buttons: [
      { name: 'blox1', id: '1501456427557060648' },
      { name: 'blox2', id: '1501456435702136900' },
      { name: 'blox3', id: '1501456439124689016' },
      { name: 'blox4', id: '1501456440353886372' },
      { name: 'blox5', id: '1501456442136465418' },
      { name: 'blox6', id: '1501456443293831168' },
      { name: 'blox7', id: '1501456444648591481' },
      { name: 'blox8', id: '1501456446150414397' },
      { name: 'blox9', id: '1501456447613960222' },
    ],
    canvas: ['blox1', 'blox2', 'blox3', 'blox4', 'blox5', 'blox6', 'blox7', 'blox8', 'blox9'],
  },
  bloxed: {
    buttons: [
      { name: 'bloxed1', id: '1501456508980957315' },
      { name: 'bloxed2', id: '1501456510197432330' },
      { name: 'bloxed3', id: '1501456511161864192' },
      { name: 'bloxed4', id: '1501456512214896830' },
      { name: 'bloxed5', id: '1501456523946233919' },
      { name: 'bloxed6', id: '1501456525057855558' },
      { name: 'bloxed7', id: '1501456526404223026' },
      { name: 'bloxed8', id: '1501456528652111993' },
      { name: 'bloxed9', id: '1501456529620996116' },
    ],
    canvas: ['bloxed1', 'bloxed2', 'bloxed3', 'bloxed4', 'bloxed5', 'bloxed6', 'bloxed7', 'bloxed8', 'bloxed9'],
  },
  bnum: {
    buttons: [
      { name: 'bnum1', id: '1501457202060202035' },
      { name: 'bnum2', id: '1501457204253823036' },
      { name: 'bnum3', id: '1501457205772157008' },
      { name: 'bnum4', id: '1501457206711943278' },
      { name: 'bnum5', id: '1501457208003530762' },
      { name: 'bnum6', id: '1501457209048039444' },
      { name: 'bnum7', id: '1501457210453266553' },
      { name: 'bnum8', id: '1501457211938050118' },
      { name: 'bnum9', id: '1501457213435150366' },
    ],
    canvas: ['bnum1', 'bnum2', 'bnum3', 'bnum4', 'bnum5', 'bnum6', 'bnum7', 'bnum8', 'bnum9'],
  },
  head: {
    buttons: [
      { name: 'head1', id: '1501457234448613466' },
      { name: 'head2', id: '1501457235661033524' },
      { name: 'head3', id: '1501457237208600666' },
      { name: 'head4', id: '1501457238655504475' },
      { name: 'head5', id: '1501457240002138162' },
      { name: 'head6', id: '1501457241310494770' },
      { name: 'head7', id: '1501457243135017052' },
      { name: 'head8', id: '1501457244607348776' },
      { name: 'head9', id: '1501457245840478268' },
    ],
    canvas: ['head1', 'head2', 'head3', 'head4', 'head5', 'head6', 'head7', 'head8', 'head9'],
  },
  pnum: {
    buttons: [
      { name: 'pnum1', id: '1501457617036247050' },
      { name: 'pnum2', id: '1501457618286153769' },
      { name: 'pnum3', id: '1501457619846565908' },
      { name: 'pnum4', id: '1501457621050458152' },
      { name: 'pnum5', id: '1501457622107160617' },
      { name: 'pnum6', id: '1501457623642275960' },
      { name: 'pnum7', id: '1501457624875401257' },
      { name: 'pnum8', id: '1501457626645401600' },
      { name: 'pnum9', id: '1501457628013006998' },
    ],
    canvas: ['pnum1', 'pnum2', 'pnum3', 'pnum4', 'pnum5', 'pnum6', 'pnum7', 'pnum8', 'pnum9'],
  },
  prhex: {
    buttons: [
      { name: 'prhex1', id: '1501457650188161024' },
      { name: 'prhex2', id: '1501457652121731132' },
      { name: 'prhex3', id: '1501457653677821962' },
      { name: 'prhex4', id: '1501457655137570837' },
      { name: 'prhex5', id: '1501457656760762418' },
      { name: 'prhex6', id: '1501457658119454731' },
      { name: 'prhex7', id: '1501457659516289185' },
      { name: 'prhex8', id: '1501457660778647745' },
      { name: 'prhex9', id: '1501457662188191794' },
    ],
    canvas: ['prhex1', 'prhex2', 'prhex3', 'prhex4', 'prhex5', 'prhex6', 'prhex7', 'prhex8', 'prhex9'],
  },
  
  ai: {
    buttons: [
      { name: 'ai1', id: '1501461712665317481' },
      { name: 'ai2', id: '1501461714213011637' },
      { name: 'ai3', id: '1501461715987206224' },
      { name: 'ai4', id: '1501461717396230204' },
      { name: 'ai5', id: '1501461718742732901' },
      { name: 'ai6', id: '1501461720625971230' },
      { name: 'ai7', id: '1501461721695522988' },
      { name: 'ai8', id: '1501461723033636874' },
      { name: 'ai9', id: '1501461724388397197' },
    ],
    canvas: ['ai1', 'ai2', 'ai3', 'ai4', 'ai5', 'ai6', 'ai7', 'ai8', 'ai9'],
  },
  bigfaces: {
    buttons: [
      { name: 'bf1', id: '1501461747599540254' },
      { name: 'bf2', id: '1501461749130596392' },
      { name: 'bf3', id: '1501461750271180801' },
      { name: 'bf4', id: '1501461751504437248' },
      { name: 'bf5', id: '1501461752926441513' },
      { name: 'bf6', id: '1501461754629197944' },
      { name: 'bf7', id: '1501461756458041404' },
      { name: 'bf8', id: '1501461758202871818' },
      { name: 'bf9', id: '1501461759515431002' },
    ],
    canvas: ['bf1', 'bf2', 'bf3', 'bf4', 'bf5', 'bf6', 'bf7', 'bf8', 'bf9'],
  },
  bmcl: {
    buttons: [
      { name: 'bmcl1', id: '1501462196868087850' },
      { name: 'bmcl2', id: '1501462198063595659' },
      { name: 'bmcl3', id: '1501462199913283684' },
      { name: 'bmcl4', id: '1501462201171443712' },
      { name: 'bmcl5', id: '1501462202165628968' },
      { name: 'bmcl6', id: '1501462203348553808' },
      { name: 'bmcl7', id: '1501462207215697920' },
      { name: 'bmcl8', id: '1501462204598321172' },
      { name: 'bmcl9', id: '1501462206045491200' },
    ],
    canvas: ['bmcl1', 'bmcl2', 'bmcl3', 'bmcl4', 'bmcl5', 'bmcl6', 'bmcl7', 'bmcl8', 'bmcl9'],
  },
  bmclet: {
    buttons: [
      { name: 'bmclet1', id: '1501462235212681236' },
      { name: 'bmclet2', id: '1501462236508721172' },
      { name: 'bmclet3', id: '1501462237674475604' },
      { name: 'bmclet4', id: '1501462239079563324' },
      { name: 'bmclet5', id: '1501462240811941888' },
      { name: 'bmclet6', id: '1501462242133016577' },
      { name: 'bmclet7', id: '1501462243789901975' },
      { name: 'bmclet8', id: '1501462245195120661' },
      { name: 'bmclet9', id: '1501462246885167214' },
    ],
    canvas: ['bmclet1', 'bmclet2', 'bmclet3', 'bmclet4', 'bmclet5', 'bmclet6', 'bmclet7', 'bmclet8', 'bmclet9'],
  },
  brnum: {
    buttons: [
      { name: 'brnum1', id: '1501462852949508227' },
      { name: 'brnum2', id: '1501462854618845214' },
      { name: 'brnum3', id: '1501462855688654938' },
      { name: 'brnum4', id: '1501462857420640276' },
      { name: 'brnum5', id: '1501462858628595732' },
      { name: 'brnum6', id: '1501462860230955049' },
      { name: 'brnum7', id: '1501462862017593374' },
      { name: 'brnum8', id: '1501462863661764690' },
      { name: 'brnum9', id: '1501462864802615367' },
    ],
    canvas: ['brnum1', 'brnum2', 'brnum3', 'brnum4', 'brnum5', 'brnum6', 'brnum7', 'brnum8', 'brnum9'],
  },
  bword: {
    buttons: [
      { name: 'bword1', id: '1501463090087198793' },
      { name: 'bword2', id: '1501463092339539978' },
      { name: 'bword3', id: '1501463093627191326' },
      { name: 'bword4', id: '1501463095095201875' },
      { name: 'bword5', id: '1501463096462671872' },
      { name: 'bword6', id: '1501463098291130459' },
      { name: 'bword7', id: '1501463099654541323' },
      { name: 'bword8', id: '1501463101726265344' },
      { name: 'bword9', id: '1501463103248797777' },
    ],
    canvas: ['bword1', 'bword2', 'bword3', 'bword4', 'bword5', 'bword6', 'bword7', 'bword8', 'bword9'],
  },
  bwords: {
    buttons: [
      { name: 'bwords1', id: '1501463138959097986' },
      { name: 'bwords2', id: '1501463139965992990' },
      { name: 'bwords3', id: '1501463141429809212' },
      { name: 'bwords4', id: '1501463143216451646' },
      { name: 'bwords5', id: '1501463144466354307' },
      { name: 'bwords6', id: '1501463145787555881' },
      { name: 'bwords7', id: '1501463147314417674' },
      { name: 'bwords8', id: '1501463148455137401' },
      { name: 'bwords9', id: '1501463150028128296' },
    ],
    canvas: ['bwords1', 'bwords2', 'bwords3', 'bwords4', 'bwords5', 'bwords6', 'bwords7', 'bwords8', 'bwords9'],
  },
  elements: {
    buttons: [
      { name: 'element1', id: '1501463560323072072' },
      { name: 'element2', id: '1501463563259084811' },
      { name: 'element3', id: '1501463565629128775' },
      { name: 'element4', id: '1501463567600455750' },
      { name: 'element5', id: '1501463568875257988' },
      { name: 'element6', id: '1501463570083352626' },
      { name: 'element7', id: '1501463571803017267' },
      { name: 'element8', id: '1501463572931416124' },
      { name: 'element9', id: '1501463574135050331' },
    ],
    canvas: ['element1', 'element2', 'element3', 'element4', 'element5', 'element6', 'element7', 'element8', 'element9'],
  },
  gmcl: {
    buttons: [
      { name: 'gmcl1', id: '1501463782013141012' },
      { name: 'gmcl2', id: '1501463783590334504' },
      { name: 'gmcl3', id: '1501463784773124237' },
      { name: 'gmcl4', id: '1501463786060513440' },
      { name: 'gmcl5', id: '1501463787868524665' },
      { name: 'gmcl6', id: '1501463790880030832' },
      { name: 'gmcl7', id: '1501463792167551077' },
      { name: 'gmcl8', id: '1501463793396617237' },
      { name: 'gmcl9', id: '1501463794235474013' },
    ],
    canvas: ['gmcl1', 'gmcl2', 'gmcl3', 'gmcl4', 'gmcl5', 'gmcl6', 'gmcl7', 'gmcl8', 'gmcl9'],
  },
  gmclet: {
    buttons: [
      { name: 'gmclet1', id: '1501463823952117760' },
      { name: 'gmclet2', id: '1501463824954425374' },
      { name: 'gmclet3', id: '1501463826615500820' },
      { name: 'gmclet4', id: '1501463828234502227' },
      { name: 'gmclet5', id: '1501463829887057990' },
      { name: 'gmclet6', id: '1501463842377695272' },
      { name: 'gmclet7', id: '1501463844189638686' },
      { name: 'gmclet8', id: '1501463845460246538' },
      { name: 'gmclet9', id: '1501463847016599673' },
    ],
    canvas: ['gmclet1', 'gmclet2', 'gmclet3', 'gmclet4', 'gmclet5', 'gmclet6', 'gmclet7', 'gmclet8', 'gmclet9'],
  },
  heart: {
    buttons: [
      { name: 'heart1', id: '1501464189300903976' },
      { name: 'heart2', id: '1501464190454333551' },
      { name: 'heart3', id: '1501464192060751872' },
      { name: 'heart4', id: '1501464193587740746' },
      { name: 'heart5', id: '1501464194787053708' },
      { name: 'heart6', id: '1501464196456513646' },
      { name: 'heart7', id: '1501464197706551418' },
      { name: 'heart8', id: '1501464199279149126' },
      { name: 'heart9', id: '1501464210477940837' },
    ],
    canvas: ['heart1', 'heart2', 'heart3', 'heart4', 'heart5', 'heart6', 'heart7', 'heart8', 'heart9'],
  },
  jr: {
    buttons: [
      { name: 'jr1', id: '1501464235539173446' },
      { name: 'jr2', id: '1501464236717641748' },
      { name: 'jr3', id: '1501464237774475334' },
      { name: 'jr4', id: '1501464238982565960' },
      { name: 'jr5', id: '1501464241000157234' },
      { name: 'jr6', id: '1501464242107187231' },
      { name: 'jr7', id: '1501464243210420266' },
      { name: 'jr8', id: '1501464244607258634' },
      { name: 'jr9', id: '1501464245714554930' },
    ],
    canvas: ['jr1', 'jr2', 'jr3', 'jr4', 'jr5', 'jr6', 'jr7', 'jr8', 'jr9'],
  },
  marshmallow: {
    buttons: [
      { name: 'marsh1', id: '1501464597289369781' },
      { name: 'marsh2', id: '1501464599034335232' },
      { name: 'marsh3', id: '1501464600984420462' },
      { name: 'marsh4', id: '1501464602288984084' },
      { name: 'marsh5', id: '1501464603606122707' },
      { name: 'marsh6', id: '1501464606567174286' },
      { name: 'marsh7', id: '1501464608228114502' },
      { name: 'marsh8', id: '1501464609637404692' },
      { name: 'marsh9', id: '1501464611147223110' },
    ],
    canvas: ['marsh1', 'marsh2', 'marsh3', 'marsh4', 'marsh5', 'marsh6', 'marsh7', 'marsh8', 'marsh9'],
  },
  num: {
    buttons: [
      { name: 'num1', id: '1501464642130808862' },
      { name: 'num2', id: '1501464643254878308' },
      { name: 'num3', id: '1501464645108764742' },
      { name: 'num4', id: '1501464646828298260' },
      { name: 'num5', id: '1501464647994310656' },
      { name: 'num6', id: '1501464649479225364' },
      { name: 'num7', id: '1501464650636595221' },
      { name: 'num8', id: '1501464651882303518' },
      { name: 'num9', id: '1501464651882303518' },
    ],
    canvas: ['num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9'],
  },
  phex: {
    buttons: [
      { name: 'phex1', id: '1501465021698408539' },
      { name: 'phex2', id: '1501465023363678291' },
      { name: 'phex3', id: '1501465024768507914' },
      { name: 'phex4', id: '1501465026299428995' },
      { name: 'phex5', id: '1501465027859841034' },
      { name: 'phex6', id: '1501465028874866818' },
      { name: 'phex7', id: '1501465030632144959' },
      { name: 'phex8', id: '1501465032159002644' },
      { name: 'phex9', id: '1501465033870282803' },
    ],
    canvas: ['phex1', 'phex2', 'phex3', 'phex4', 'phex5', 'phex6', 'phex7', 'phex8', 'phex9'],
  },
  pride: {
    buttons: [
      { name: 'pride1', id: '1501348702248239274' },
      { name: 'pride2', id: '1501348703359860876' },
      { name: 'pride3', id: '1501348704987123903' },
      { name: 'pride4', id: '1501348706430226452' },
      { name: 'pride5', id: '1501348714550136862' },
      { name: 'pride6', id: '1501348715691245688' },
      { name: 'pride7', id: '1501348716857266367' },
      { name: 'pride8', id: '1501348717893128232' },
      { name: 'pride9', id: '1501348720057254049' },
    ],
    canvas: ['pride1', 'pride2', 'pride3', 'pride4', 'pride5', 'pride6', 'pride7', 'pride8', 'pride9'],
  },
  pword: {
    buttons: [
      { name: 'pword1', id: '1501465061103763607' },
      { name: 'pword2', id: '1501465062941130824' },
      { name: 'pword3', id: '1501465064429846528' },
      { name: 'pword4', id: '1501465066170749059' },
      { name: 'pword5', id: '1501465067084841042' },
      { name: 'pword6', id: '1501465068469223446' },
      { name: 'pword7', id: '1501465069857280011' },
      { name: 'pword8', id: '1501465071493320864' },
      { name: 'pword9', id: '1501465073351131186' },
    ],
    canvas: ['pword1', 'pword2', 'pword3', 'pword4', 'pword5', 'pword6', 'pword7', 'pword8', 'pword9'],
  },
};

const difficultyMap = {
  'very easy': 'easy',
  'easy': 'easy',
  'medium': 'medium',
  'hard': 'hard',
  'very hard': 'hard',
  'expert': 'expert',
};

const difficulties = {
  'very easy': [45, 50],
  'easy': [40, 44],
  'medium': [34, 39],
  'hard': [28, 33],
  'very hard': [22, 27],
  'expert': [17, 21],
};

function titleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function wrapRows(rows) {
  // Wrap plain arrays of buttons in ActionRowBuilder and filter empty rows
  return rows
    .filter(r => r && r.length > 0)
    .map(r => {
      const row = new ActionRowBuilder();
      row.addComponents(...r.slice(0, 5)); // Discord max 5 buttons per row
      return row;
    });
}

function createGridButtons(gameState, userId) {
  const rows = [];

  // --- 3x3 grid selection buttons ---
  for (let row = 0; row < 3; row++) {
    const rowButtons = [];
    for (let col = 0; col < 3; col++) {
      const gridNum = row * 3 + col + 1;
      rowButtons.push(
        new ButtonBuilder()
          .setCustomId(`grid_${gridNum}`)
          .setLabel(`${gridNum}`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    rows.push(rowButtons);
  }

  // --- Control row ---
  const currentPlayerId = gameState.joinedPlayers[gameState.currentTurnIndex];
  const isCurrentPlayer = userId === currentPlayerId;
  const controlButtons = [];

  if (gameState.mode === 'multi' && isCurrentPlayer && gameState.joinedPlayers.length > 1) {
    controlButtons.push(
      new ButtonBuilder()
        .setCustomId('end_turn')
        .setLabel('End Your Turn')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (gameState.mode === 'single' || gameState.mode === 'daily') {
    controlButtons.push(
      new ButtonBuilder()
        .setCustomId('end_game')
        .setLabel('End Game')
        .setStyle(ButtonStyle.Danger)
    );
  }

  if (controlButtons.length) rows.push(controlButtons);

  // --- Extra row for multiplayer leave/end ---
  if (gameState.mode === 'multi') {
    const extraButtons = [];
    if (gameState.joinedPlayers.length > 1) {
      extraButtons.push(
        new ButtonBuilder()
          .setCustomId('leave_game')
          .setLabel('Leave Game')
          .setStyle(ButtonStyle.Danger)
      );
    } else {
      extraButtons.push(
        new ButtonBuilder()
          .setCustomId('end_game')
          .setLabel('End Game')
          .setStyle(ButtonStyle.Danger)
      );
    }
    if (extraButtons.length) rows.push(extraButtons);
  }

  return wrapRows(rows);
}

function createLobbyButtons(gameState, userId) {
  const rows = [];
  const rowButtons = [];
  const maxPlayers = 4;
  const isHost = gameState.hostId === gameState.joinedPlayers[0];
  const isFull = gameState.joinedPlayers.length >= maxPlayers;

  if (gameState.mode === 'multi' && !isFull) {
    rowButtons.push(
      new ButtonBuilder()
        .setCustomId('join_game')
        .setLabel('Join Game')
        .setStyle(ButtonStyle.Success)
    );
  }

  if (gameState.mode === 'multi' && gameState.joinedPlayers.length >= 2 && isHost) {
    rowButtons.push(
      new ButtonBuilder()
        .setCustomId('start_game')
        .setLabel('Start Game')
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (gameState.joinedPlayers.length > 1 && gameState.joinedPlayers.includes(userId)) {
    rowButtons.push(
      new ButtonBuilder()
        .setCustomId('leave_game_lobby')
        .setLabel('Leave Game')
        .setStyle(ButtonStyle.Danger)
    );
  }

  if (gameState.joinedPlayers.length >= 1 && gameState.joinedPlayers.includes(userId) && isHost) {
    rowButtons.push(
      new ButtonBuilder()
        .setCustomId('end_game_lobby')
        .setLabel('End Game')
        .setStyle(ButtonStyle.Danger)
    );
  }

  if (rowButtons.length) rows.push(rowButtons);
  return wrapRows(rows);
}

function getTurnEmbedFields(gameState) {
  if (gameState.mode === 'multi') {
    const players = gameState.joinedPlayers;
    const mention = id => `<@${id}>`;
    const current = players[gameState.currentTurnIndex % players.length];
    const next = players[(gameState.currentTurnIndex + 1) % players.length];
    const all = players.map(mention).join(', ');

    return [
      { name: 'Current Player', value: mention(current), inline: true },
      { name: 'Next Player', value: mention(next), inline: true },
      { name: 'All Players', value: all, inline: false },
    ];
  }
  return [];
}

function createCellButtons(theme, prefilledSet, puzzle, selectedGrid, mode, joinedPlayers) {
  const rows = [];
  const themeData = emojiThemes[theme] || emojiThemes['default'];
  const startRow = Math.floor(selectedGrid / 3) * 3;
  const startCol = (selectedGrid % 3) * 3;

  // --- 3x3 Sudoku grid buttons ---
  for (let row = 0; row < 3; row++) {
    const rowButtons = [];
    for (let col = 0; col < 3; col++) {
      const globalRow = startRow + row;
      const globalCol = startCol + col;
      const index = globalRow * 9 + globalCol;
      const value = puzzle[index];
      const isPrefilled = prefilledSet.has(index);

      let labelOrEmoji;
      if (Array.isArray(themeData.buttons) &&
          value !== null &&
          themeData.buttons[value - 1] && // Adjust for 1-based value to 0-based index
          typeof themeData.buttons[value - 1] === 'object' &&
          themeData.buttons[value - 1].id) {
        labelOrEmoji = { id: themeData.buttons[value - 1].id }; // Adjust index
      } else if (value !== null) {
        labelOrEmoji = themeData.buttons[value - 1] || `${value}`; // Adjust index
      } else {
        labelOrEmoji = '•';
      }

      const btn = new ButtonBuilder()
        .setCustomId(`cell_${index}`)
        .setDisabled(isPrefilled)
        .setStyle(isPrefilled ? ButtonStyle.Secondary : ButtonStyle.Primary);

      if (typeof labelOrEmoji === 'object') btn.setEmoji(labelOrEmoji);
      else btn.setLabel(labelOrEmoji);

      rowButtons.push(btn);
    }
    rows.push(rowButtons);
  }

  // --- Control row ---
  const controlButtons = [];
  if ((mode === 'multi' && joinedPlayers.length > 1) || mode === 'single' || mode === 'daily') {
    controlButtons.push(
      new ButtonBuilder()
        .setCustomId('back_to_grid')
        .setLabel('Back to Grid')
        .setStyle(ButtonStyle.Secondary)
    );
  }
  if (controlButtons.length) rows.push(controlButtons);

  return wrapRows(rows);
}

function createNumberButtons(theme, prefilledSet, puzzle, selectedCell, mode, pencilMode, joinedPlayers) {
  const rows = [];
  const themeData = emojiThemes[theme] || emojiThemes['default'];

  // --- Number buttons ---
  for (let row = 0; row < 3; row++) {
    const rowButtons = [];
    for (let col = 0; col < 3; col++) {
      const num = row * 3 + col + 1;
      const btn = new ButtonBuilder()
        .setCustomId(`num_${num}`)
        .setStyle(selectedCell !== null && puzzle[selectedCell] === num ? ButtonStyle.Primary : ButtonStyle.Secondary);

      const themeButton = themeData.buttons?.[num - 1];
      if (themeButton && typeof themeButton === 'object' && themeButton.id) btn.setEmoji({ id: themeButton.id });
      else btn.setLabel(themeButton || `${num}`);

      rowButtons.push(btn);
    }
    rows.push(rowButtons);
  }

  // --- Control row ---
  const controlButtons = [
    new ButtonBuilder()
      .setCustomId('back_to_cell')
      .setLabel('Back to Cells')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('pencil_mode')
      .setLabel('Pencil Mode')
      .setStyle(pencilMode ? ButtonStyle.Success : ButtonStyle.Secondary),
  ];
  rows.push(controlButtons);

  return wrapRows(rows);
}

function getConflictingCells(puzzle) {
  const conflicts = new Set();

  for (let i = 0; i < 81; i++) {
    const val = puzzle[i];
    if (val === null) continue;

    const row = Math.floor(i / 9);
    const col = i % 9;
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);

    for (let j = 0; j < 81; j++) {
      if (i === j || puzzle[j] === null) continue;
      if (puzzle[j] !== val) continue;

      const otherRow = Math.floor(j / 9);
      const otherCol = j % 9;

      const sameRow = otherRow === row;
      const sameCol = otherCol === col;
      const sameBox =
        Math.floor(otherRow / 3) === boxRow &&
        Math.floor(otherCol / 3) === boxCol;

      if (sameRow || sameCol || sameBox) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
  }

  return conflicts;
}

function applyCompletionUI(container, gameState) {
  const filledCells = gameState.puzzle.filter(n => n !== null).length;
  const totalCells = 81;
  const isComplete = filledCells === totalCells;

  if (isComplete) {
    const isCorrect = gameState.allSolutions.some(sol =>
      sol.every((num, idx) => num === gameState.puzzle[idx])
    );
    if (isCorrect) {
      container.addTextDisplayComponents(td =>
        td.setContent('🎉 Congratulations! You solved the puzzle!')
      );
      return { complete: true, correct: true };
    } else {
      container.addTextDisplayComponents(td =>
        td.setContent('✖️ The puzzle is not correct yet. Keep trying!')
      );
      return { complete: true, correct: false };
    }
  }

  return { complete: false, correct: false };
}

async function getuserConfData(userId) {
  const userConfigData = await userConfData.findOne({ userId });
  return userConfigData?.font || 'NightBlood';
}

async function drawSudokuGrid(puzzle, prefilledSet, theme, selectedCell, selectedValue, selectedGrid, conflictSet = new Set(),  notes = [], userId) {
  prefilledSet = prefilledSet instanceof Set ? prefilledSet : new Set(prefilledSet);
  conflictSet = conflictSet instanceof Set ? conflictSet : new Set(conflictSet);
  
  const fontFamily = await getuserConfData(userId);
  const cellSize = 60;
  const size = 540;
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#91939F';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#A8AAB7';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 9; i++) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  ctx.strokeStyle = '#DADCE3';
  ctx.lineWidth = 5;
  for (let i = 0; i <= 3; i++) {
    const pos = i * cellSize * 3;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  if (selectedGrid != null) {
    const startRow = Math.floor(selectedGrid / 3) * 3;
    const startCol = (selectedGrid % 3) * 3;
    ctx.fillStyle = 'rgba(87, 114, 212, 0.15)';
    ctx.fillRect(startCol * cellSize, startRow * cellSize, cellSize * 3, cellSize * 3);
  }

  if (conflictSet && conflictSet.size > 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    for (const idx of conflictSet) {
      const row = Math.floor(idx / 9);
      const col = idx % 9;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  if (selectedCell != null) {
    const row = Math.floor(selectedCell / 9);
    const col = selectedCell % 9;
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);

    ctx.fillStyle = 'rgba(87, 114, 212, 0.1)';
    ctx.fillRect(0, row * cellSize, size, cellSize);
    ctx.fillRect(col * cellSize, 0, cellSize, size);
    ctx.fillRect(boxCol * cellSize * 3, boxRow * cellSize * 3, cellSize * 3, cellSize * 3);

    ctx.fillStyle = 'rgba(87, 114, 212, 0.3)';
    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
  }

  notes = Array.isArray(notes) ? notes.map(n => (n instanceof Set ? n : new Set(n))) : Array.from({ length: 81 }, () => new Set());
  
  if (theme === 'default') {
    ctx.fillStyle = '#0E0f12';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 81; i++) {
      const val = puzzle[i];
      const col = i % 9;
      const row = Math.floor(i / 9);

      if (val != null) {
        ctx.font = `bold 30px ${fontFamily}`;
        ctx.fillStyle = prefilledSet.has(i) ? '#000' : '#0E0f12';
        ctx.fillText((val).toString(), col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
      } else if (notes[i] && notes[i].size > 0) {
        ctx.font = `18px ${fontFamily}`;
        ctx.fillStyle = '#0E0f12';
        Array.from(notes[i])
          .sort((a, b) => a - b)
          .forEach(n => {
            const subRow = Math.floor((n - 1) / 3);
            const subCol = (n - 1) % 3;
            const x = col * cellSize + subCol * (cellSize / 3) + (cellSize / 6);
            const y = row * cellSize + subRow * (cellSize / 3) + (cellSize / 6);
            ctx.fillText(n.toString(), x, y);
          });
      }
    }
  } else {
    const themeLower = theme.toLowerCase();
    const themeConfig = themeRegistry[themeLower];
    const emojiImages = {};

    if (themeConfig?.folder && themeConfig?.prefix) {
      const emojiDir = path.join(__dirname, `../../assets/${themeConfig.folder}/${themeLower}`);
      
      for (let i = 1; i <= 9; i++) {
        const emojiPath = path.join(emojiDir, `${themeConfig.prefix}${i}.png`);
        if (fs.existsSync(emojiPath)) emojiImages[i] = await Canvas.loadImage(emojiPath);
      }
    }

    for (let i = 0; i < 81; i++) {
      const val = puzzle[i];
      const col = i % 9;
      const row = Math.floor(i / 9);
      const x = col * cellSize;
      const y = row * cellSize;

      if (val != null && emojiImages[val]) {
        const padding = 10;
        ctx.drawImage(emojiImages[val], x + padding, y + padding, cellSize - 2 * padding, cellSize - 2 * padding);
      } else if (notes[i] && notes[i].size > 0) {
        const miniSize = cellSize / 3 - 4;
        Array.from(notes[i])
          .sort((a, b) => a - b)
          .forEach(n => {
            const subRow = Math.floor((n - 1) / 3);
            const subCol = (n - 1) % 3;
            const nx = x + subCol * (cellSize / 3) + 2;
            const ny = y + subRow * (cellSize / 3) + 2;
            if (emojiImages[n]) ctx.drawImage(emojiImages[n], nx, ny, miniSize, miniSize);
          });
      }
    }
  }

  return canvas.toBuffer();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const difficultyChoices = Object.keys(difficulties).map(key => ({
  name: titleCase(key),
  value: key
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sudoku')
    .setDescription('Play Sudoku')
    .addSubcommand(subcmd =>
      subcmd
        .setName('play')
        .setDescription('Play a new Sudoku game')
        .addStringOption(opt =>
          opt
            .setName('difficulty')
            .setDescription('Select difficulty')
            .setRequired(true)
            .addChoices(...difficultyChoices)
        )
        .addStringOption(opt =>
          opt
            .setName('theme')
            .setDescription('Select emoji theme')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(opt =>
          opt
            .setName('mode')
            .setDescription('Game mode')
            .setRequired(true)
            .addChoices(
              { name: 'Singleplayer', value: 'single' },
              { name: 'Multiplayer', value: 'multi' },
            )
        )
    ),
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'theme') {
      const choices = await getAvailableThemes(
        interaction.user.id,
        interaction.guildId,
        interaction.guild
      );
      const filtered = choices.filter(c =>
        c.name.toLowerCase().startsWith(focused.value.toLowerCase())
      );
      await interaction.respond(filtered.slice(0, 25));
    }
  },
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'play') {
        const difficulty = interaction.options.getString('difficulty') || 'easy';
        const theme = interaction.options.getString('theme') || 'default';

        const availableThemes = await getAvailableThemes(interaction.user.id, interaction.guildId, interaction.guild);
        if (!availableThemes.some(t => t.value === theme)) {
          return interaction.reply({
            content: `❌ You don't have access to the **${titleCase(theme)}** theme.`,
            flags: MessageFlags.Ephemeral
          });
        }

        const mode = interaction.options.getString('mode') || 'single';
        const guildId = interaction.guildId;

        let gameLimit;
        const activeGames = await SudokuGame.countDocuments({ guildId, mode });

        const supportServerId = "1412083896300077140";
        if (guildId === supportServerId) {
            gameLimit = 125;
        } else {
          gameLimit = 25;
        }

        if (activeGames >= gameLimit) {
            return interaction.reply({
                content: `❌ This server already has ${gameLimit} active **${titleCase(mode)}player** Sudoku games.\nPlease wait until a **${titleCase(mode)}player** game ends.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const validDifficulty = difficultyMap[difficulty] || 'easy';
        const [minPrefilled, maxPrefilled] = difficulties[difficulty] || difficulties['easy'];
        const targetPrefilled = Math.floor(Math.random() * (maxPrefilled - minPrefilled + 1)) + minPrefilled;
        const allSolutions = [];
        const maxSolutions = 25;
        let attempts = 0;
        const maxAttempts = 50;

        while (allSolutions.length < maxSolutions && attempts < maxAttempts) {
            attempts++;

            try {
                const sudoku = getSudoku(validDifficulty);
                if (!sudoku || !sudoku.puzzle || sudoku.puzzle.length !== 81) {
                    throw new Error('Invalid Sudoku board');
                }

                const solution = sudoku.solution.split('').map(n => parseInt(n, 10));

                if (!allSolutions.some(s => arraysEqual(s, solution))) {
                    allSolutions.push(solution);
                }

            } catch (err) {
                console.error(`Error generating sudoku: ${err.message}`);
                return interaction.reply({
                    content: 'Could not generate a valid puzzle for this difficulty. Try again.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        const firstSolution = allSolutions[0];
        let puzzle = Array(81).fill(null);

        const indices = Array.from({ length: 81 }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const prefilledIndexes = indices.slice(0, targetPrefilled);
        for (const idx of prefilledIndexes) {
            puzzle[idx] = firstSolution[idx];
        }

        const prefilledSet = new Set(prefilledIndexes);
        const conflictSet = getConflictingCells(puzzle);

        const gameState = {
            puzzle,
            originalPuzzle: firstSolution,
            prefilledSet,
            theme,
            difficulty,
            mode,
            hostId: interaction.user.id,
            selectedCell: null,
            selectedValue: null,
            selectedGrid: null,
            conflictSet,
            allSolutions,
            joinedPlayers: mode === 'multi' ? [interaction.user.id] : [],
            currentTurnIndex: 0,
            started: false,
            pencilMode: false,
            notes: Array.from({ length: 81 }, () => []),
        };

        const scope = interaction.channelId ? `${interaction.channelId}-${interaction.user.id}` : `user-${interaction.user.id}`;
        const gameId = `sudoku-${scope}`;

        const existingSingle = await SudokuGame.findOne({ mode: 'single', hostId: interaction.user.id });
        if (existingSingle) {
          const endButton = new ButtonBuilder()
            .setCustomId(`end_old_game_${existingSingle._id}`)
            .setLabel('End Game')
            .setStyle(ButtonStyle.Danger)

          const restartButton = new ButtonBuilder()
            .setCustomId(`end_old_game_${existingSingle._id}__${difficulty}__${theme}__${mode}`)
            .setLabel('End & Start New')
            .setStyle(ButtonStyle.Primary)

          const row = new ActionRowBuilder().addComponents(endButton, restartButton)
          
          return interaction.reply({ content: "You already have an active singleplayer Sudoku game. Finish it or end the game before starting a new puzzle.", components: [row], flags: MessageFlags.Ephemeral, });
        }

        const existingMulti = await SudokuGame.findOne({ mode: 'multi', $or: [{ hostId: interaction.user.id }, { joinedPlayers: { $in: [interaction.user.id] } }]});
        if (existingMulti) {
          const isHost = existingMulti.hostId === interaction.user.id;
          const isLastPlayer = existingMulti.joinedPlayers.length <= 1;
          const shouldEnd = isHost || isLastPlayer;

          const actionButton = new ButtonBuilder()
            .setCustomId(`${shouldEnd ? 'end' : 'leave'}_old_game_${existingMulti._id}`)
            .setLabel(shouldEnd ? 'End Game' : 'Leave Game')
            .setStyle(ButtonStyle.Danger)

          const row = new ActionRowBuilder().addComponents(actionButton)
          return interaction.reply({ content: "You already have an active multiplayer Sudoku game. Finish it or leave/end the game before starting a new puzzle.", components: [row], flags: MessageFlags.Ephemeral, });
        }

        const existingDaily = await SudokuGame.findOne({ hostId: interaction.user.id, mode: 'daily' });
        if (existingDaily) {
          const endButton = new ButtonBuilder()
            .setCustomId(`end_old_game_${existingDaily._id}`)
            .setLabel('End Game')
            .setStyle(ButtonStyle.Danger)
          
          const row = new ActionRowBuilder().addComponents(endButton)
          return interaction.reply({ content: "You already have an active Daily Sudoku game. Finish it or end the game before starting a new puzzle.", components: [row], flags: MessageFlags.Ephemeral, });
        }

        games.set(gameId, gameState);

        const filledCells = gameState.puzzle.filter(n => n !== null).length;
        const percent = Math.floor((filledCells / 81) * 100);
        const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, gameState.selectedCell, gameState.selectedValue, gameState.selectedGrid, gameState.conflictSet, gameState.notes, interaction.user.id);
        const attachmentName = 'sudoku.png';
        const attachment = new AttachmentBuilder(buffer, { name: attachmentName });
        const buttonRows = mode === 'multi' && !gameState.started ? createLobbyButtons(gameState, interaction.user.id) : createGridButtons(gameState, interaction.user.id);
        const themeLabel = themeRegistry[gameState.theme]?.label || titleCase(gameState.theme);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### ${themeLabel} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
            .addMediaGalleryComponents(g => g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachmentName}`)))
            .addSeparatorComponents(s => s)
            .addActionRowComponents(...buttonRows.filter(Boolean));
        
        if (interaction._autoStart) {
          await interaction.followUp({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
        } else {
          await interaction.reply({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
        }

        const sentMessage = await interaction.fetchReply();
        gameState.messageId = sentMessage.id;
        games.set(gameId, gameState);

        const sudokuData = new SudokuGame({
            _id: new mongoose.Types.ObjectId(),
            gameId,
            guildId,
            puzzle,
            originalPuzzle: firstSolution,
            prefilledSet: Array.from(prefilledSet),
            theme,
            difficulty,
            mode,
            hostId: interaction.user.id,
            joinedPlayers: [],
            currentTurnIndex: 0,
            selectedCell: null,
            selectedValue: null,
            selectedGrid: null,
            started: false,
            conflictSet: Array.from(conflictSet),
            allSolutions,
            pencilMode: false,
            notes: Array(81).fill([]),
            lastUpdated: new Date(),
            messageId: sentMessage.id
        });

        await sudokuData.save();
    }

  },

  titleCase,
  createGridButtons,
  createLobbyButtons,
  getTurnEmbedFields,
  createCellButtons,
  createNumberButtons,
  getConflictingCells,
  applyCompletionUI,
  drawSudokuGrid,
  arraysEqual,
};