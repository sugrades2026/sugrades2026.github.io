/* Turkish source text is retained for instant, state-preserving language switching. */
(function(){
const pairs=[
['Mezuniyet ortalaması','Graduation average'],
['Her dönem için dönem GPA’ni ve GPA hesabına dahil SÜ kredini gir. Henüz tamamlamadığın dönemleri boş bırakabilirsin.','Enter your semester GPA and SU credits counted towards GPA for each semester. You can leave unfinished semesters blank.'],
['+ Yaz veya ek dönem ekle','+ Add summer or extra semester'],
['Sadece GPA’ya dahil SÜ kredilerini gir; F ve GPA’ya dahil NA dersleri de hesaba katılır. P, S, U, T ve W notlu dersleri kredi toplamına ekleme.','Enter only SU credits counted towards GPA, including F and GPA-eligible NA courses. Exclude credits for P, S, U, T and W grades.'],
['Tahmini mezuniyet ortalaması','Estimated graduation average'],
['Genel GPA','Cumulative GPA'],
['Hesaplamak için dönem bilgilerini gir.','Enter semester details to calculate.'],
['Bu sonuç girilen dönemlerin kredi ağırlıklı tahminidir. Tekrarlanan veya ikame edilen derslerin eski notları dönem GPA’larında kalır; bu yüzden sonuç resmî genel GPA’dan farklı olabilir. Yuvarlama da küçük fark yaratabilir. Kesin sonuç için transkriptini kontrol et; program ortalaması ayrıca hesaplanır. ','This is a credit-weighted estimate from the semesters entered. Old grades for repeated or substituted courses remain in semester GPAs, so the result may differ from the official cumulative GPA. Rounding can also cause small differences. Check your transcript for the official result; the program GPA is calculated separately. '],
['Üniversitenin not sistemi ↗','University grading system ↗'],
['Dönem GPA','Semester GPA'],
['GPA kredisi','GPA credits'],
['Güz dönemi','Fall semester'],
['Bahar dönemi','Spring semester'],
['Ek dönem','Extra semester'],
['Ek dönemi sil','Remove extra semester'],
['Dolu satırlarda GPA 0–4 arasında ve kredi sıfırdan büyük olmalı; iki alanı da doldur.','For each entered semester, fill both fields: GPA must be between 0 and 4 and credits must be greater than zero.'],
['Girilen dönemlerin kredi ağırlıklı tahmini','Credit-weighted estimate of entered semesters'],
['1. yıl','Year 1'],
['2. yıl','Year 2'],
['3. yıl','Year 3'],
['4. yıl','Year 4'],
['☾ Koyu','☾ Dark'],['☀ Açık','☀ Light'],['Koyu temaya geç','Switch to dark theme'],['Açık temaya geç','Switch to light theme'],
['Tüm derslerde ara veya seç','Search or choose any course'],['Hazır syllabus şablonu bulunmayan derslerde ağırlıkları kendin girersin.','For courses without a syllabus template, enter the weights yourself.'],['Ders ara veya seç','Search or choose a course'],['Ders kodu veya adıyla arayabilirsin.','Search by course code or name.'],['Ders ara','Search courses'],['Örn. CS 201 veya Calculus','e.g. CS 201 or Calculus'],['Kapat','Close'],
['Bildirim gönder','Report an issue'],['Sorun bildir','Report an issue'],['Bir hata veya öneri paylaş. Yanıt almak istersen e-posta adresini ekleyebilirsin.','Share a problem or suggestion. Add your email address if you would like a reply.'],['Mesajın','Your message'],['Karşılaştığın sorunu anlat...','Describe the issue...'],['E-posta adresin (isteğe bağlı)','Your email address (optional)'],['Gönderdiğin bilgiler FormSubmit aracılığıyla iletilir; FormSubmit bildirimleri 30 gün saklar. Gönderim FormSubmit sayfasında tamamlanır. Hassas bilgilerini paylaşma.','Your submission is sent through FormSubmit, which retains submissions for 30 days. Submission is completed on the FormSubmit site. Do not share sensitive information.'],['Gönder','Send'],['Vazgeç','Cancel'],
['Kendi dersini oluştur','Create your own course'],
['Syllabus’taki değerlendirmeleri ve yüzde ağırlıklarını gir. Ağırlıkların toplamı %100 olmalı. Devam, bonus, çan ve özel F/NA kuralları otomatik uygulanmaz.','Enter assessment components and their percentage weights from your syllabus. Weights must total 100%. Attendance, bonus points, grading curves and special F/NA rules are not applied automatically.'],
['Ders kodunu girersen sonucu GPA hesabına ekleyebilirsin.','Enter the course code to add the result to your GPA.'],
['Ders kodu','Course code'],['Değerlendirme adı','Assessment name'],['Değerlendirme notu','Assessment score'],['Değerlendirmeyi sil','Remove assessment'],['Değerlendirme ekle','Add assessment'],['Değerlendirme','Assessment'],['Ağırlık yüzdesi','Weight percentage'],['Ağırlık %','Weight %'],['Örn. CS 201','e.g. CS 201'],['Örn. Vize','e.g. Midterm'],['Ağırlıkları kontrol et','Check the weights'],
['Ağırlıkların toplamı %100 olmalı; notlar ve ağırlıklar 0–100 arasında olmalı.','Weights must total 100%; scores and weights must be between 0 and 100.'],[' GPA hesabına eklemek için ders kodunu gir.',' Enter the course code to add this result to your GPA.'],
['Gezi videosu en fazla 5 puanlık bonus sağlayabilir. Syllabus’taki harf tablosunda tekrarlar bulunduğundan gösterilen harf örnek ölçeğe dayanan bir tahmindir.','The excursion video may add up to 5 bonus points. The syllabus letter-grade table contains repeated entries, so the displayed letter is an estimate based on an example scale.'],
['Bağımsız öğrenci aracı · Made by Sunguralp. Üniversitenin resmî uygulaması değildir. Notlar cihazında hesaplanır, sunucuya gönderilmez. ','Independent student tool · Made by Sunguralp. Not an official university application. Grades are calculated on your device and are not sent to a server. '],

['Daha az hesap, daha çok odak','Less calculation, more focus'],
['Sabancı öğrencileri için','For Sabancı students'],['Bağımsız öğrenci aracı','Independent student tool'],
['Notlarını bil,','Know your grades,'],['dönemini planla.','plan your semester.'],
['Dersindeki not ağırlıklarını tek tek hesaplamana gerek yok. Notlarını gir, durumunu hemen gör.','No need to calculate your course grades by hand. Enter your scores and see where you stand.'],
['Sabancı Üniversitesi öğrencileri için bağımsız olarak hazırlanmıştır. Ders notlarını gir, durumunu hemen gör.','Independently created for Sabancı University students. Enter your scores and see where you stand.'],
['Ders notu','Course grade'],['GPA hesapla','Calculate GPA'],['Dersini seç','Choose your course'],
['2026–2027 Güz syllabus’ları esas alınmıştır. Dersinin güncel syllabus’ını kontrol et.','Based on Fall 2026–2027 syllabi. Check your current course syllabus.'],
['Ders','Course'],['Tahmini sonuç','Estimated result'],['Şu anki durumun','Your current standing'],
['Notlarını girmeye başla','Start entering your scores'],['Boş bırakılan alanlar sıfır sayılmaz. Girdiğin notların ağırlıklı ortalaması gösterilir.','Blank fields are not counted as zero. The weighted average of your entered scores is shown.'],
['TAHMİNİ HARF NOTU','ESTIMATED LETTER GRADE'],['Notlarını girerek tahmini harf notunu gör.','Enter your scores to see an estimated letter grade.'],
['GPA hesabına ekle →','Add to GPA →'],['Harf notu sınırlarını düzenle','Edit letter grade thresholds'],
['Her harf için alt sınırı gir. Bu ölçek tahmindir; dersin resmî sınırlarını biliyorsan değiştirebilirsin.','Enter the minimum score for each letter. This scale is an estimate; change it if you know the official thresholds for your course.'],
['Derslerini ekle','Add your courses'],['Ders kodunu seç: bilinen derslerde SU kredisi otomatik dolar. Kredi değiştirilebilir. P, S, U, T ve W GPA’ya dahil edilmez.','Choose a course code: SU credits are filled in automatically for known courses and can be edited. P, S, U, T and W are excluded from GPA.'],
['Ders kodu veya adı','Course code or name'],['SU kredisi','SU credits'],['Harf notu','Letter grade'],['+ Ders ekle','+ Add course'],
['659 ders üniversitenin lisans kataloğundan alınmıştır (12 Kasım 2026). Beş dersin kredisi doğrulanamadı; elle gir. Krediler dönemlere göre değişebilir; kendi ders döneminle karşılaştır. ','659 courses are sourced from the university’s undergraduate catalog (November 12, 2026). Credits for five courses could not be verified; enter them manually. Credits may change by term; check them against your own term. '],
['Kaynağı kontrol et ↗','Check the source ↗'],[' Listede olmayan derslerin kredisini elle gir. Genel GPA için ilgili tüm derslerini ekle; tekrar edilen derslerde son notu kullan. Bu araç resmî transkript yerine geçmez.',' Enter credits manually for unlisted courses. For cumulative GPA, include all relevant courses; use the latest grade for repeated courses. This tool is not an official transcript.'],
['Kredi ağırlıklı ortalama','Credit-weighted average'],['Ders ekleyerek başla','Start by adding a course'],
['Ders hesaplayıcısından aktarılan notlar tahminidir. Çan eğrisi, devam ve özel sınav koşulları kesin sonuçları değiştirebilir.','Grades transferred from the course calculator are estimates. Grading curves, attendance and special exam rules may change the final result.'],
['Bağımsız bir öğrenci aracıdır; üniversitenin resmî uygulaması değildir. Notlar cihazında hesaplanır, sunucuya gönderilmez. ','An independent student tool; not an official university application. Grades are calculated on your device and are not sent to a server. '],
['Resmî not katsayıları ↗','Official grade points ↗'],
['5 quizin toplam ağırlığı %16. Quizlerin eşit ağırlığı syllabus’ta açıkça belirtilmediğinden ilgili ortalamayı gir. Harf notu sınırları belirtilmemiştir.','The five quizzes account for 16% in total. The syllabus does not specify equal quiz weights, so enter the applicable average. Letter grade thresholds are not specified.'],
['Syllabus’taki ağırlıklar toplam %105 ediyor. Aşağıdaki sonuç bu ağırlıklarla doğrudan hesaplanır; öğretim görevlisinden doğrula. Harf sınırları belirtilmemiştir. Başarısızlık ve iki katılım puanının da sıfır olması NA sonucuna yol açabilir.','The syllabus weights add up to 105%. The result uses these weights directly; confirm them with your instructor. Letter grade thresholds are not specified. Failing with zero points in both participation categories may result in NA.'],
['5 quiz ve 2 ödevin kategori ortalamalarını gir. Syllabus’ta harf sınırları var; ondalıkların yuvarlanması ve NA koşullarındaki ifade belirsiz olduğundan harf notunu öğretim görevlisinden doğrula.','Enter category averages for the five quizzes and two assignments. The syllabus lists letter grade thresholds, but decimal rounding and the wording of the NA conditions are unclear; confirm your grade with your instructor.'],
['Gezi videosu en fazla 5 puanlık bonus sağlayabilir. Syllabus’taki harf tablosunda tekrarlar bulunduğundan harf notu otomatik belirlenmez.','The excursion video may add up to 5 bonus points. The syllabus letter-grade table contains repeated entries, so the official letter grade cannot be determined automatically.'],
['En yüksek dört kısa quizin ortalamasını gir. Bonus 0–3 not puanıdır. Beş hafta mazeretsiz devamsızlık NA ile sonuçlanır. Harf sınırlarında kesirli notların yuvarlanması belirtilmemiştir.','Enter the average of your best four short quizzes. The bonus adds 0–3 points. Five weeks of unexcused absence results in NA. Rounding of fractional scores at letter-grade boundaries is unspecified.'],
['Sınavların eşit ağırlıklı olduğu varsayılmıştır: syllabus’taki formül ile toplam %70 ifadesi arasında belirsizlik var. Active Lecture ve Recitation %80 katılımda tam puana ulaşır. Sınav ortalaması 30’un altında veya bir sınav kaçırılmışsa F; ayrıca NA koşulları uygulanabilir. Syllabus nihai puanı yuvarlar. Bu koşullar otomatik uygulanmaz.','Exams are assumed to be equally weighted: the syllabus formula and its 70% total are ambiguous. Active Lecture and Recitation reach full credit at 80% participation. An exam average below 30 or a missed exam results in F; NA conditions may also apply. The syllabus rounds the final score. These rules are not applied automatically.'],
['Ders katılımı · en iyi 5 quiz','Lecture participation · best 5 quizzes'],['Recitation katılımı · en iyi 8','Recitation participation · best 8'],['Gezi videosu bonusu · 0–5 puan','Excursion video bonus · 0–5 points'],
['Aktif katılım','Active participation'],['Ara sınav','Midterm'],['Tez cümlesi','Thesis statement'],['En yüksek 4 kısa quiz ortalaması','Average of best 4 short quizzes'],['2 uzun quiz ortalaması','Average of 2 long quizzes'],['Bonus ödev · 0–3 puan','Bonus assignment · 0–3 points'],
['Virtual Lecture · en düşük 3 çıkarılmış','Virtual Lecture · lowest 3 dropped'],['Active Lecture · ham katılım yüzdesi','Active Lecture · raw participation percentage'],['Recitation · ham katılım yüzdesi','Recitation · raw participation percentage'],
['Ödev ortalaması','Assignment average'],['Quiz ortalaması','Quiz average'],['Vize 1','Midterm 1'],['Vize 2','Midterm 2'],['Vize','Midterm'],['2026 Güz','Fall 2026'],
['Doğrudan ek puan','Direct bonus points'],['Geçerli bir not gir','Enter a valid score'],['Her not belirtilen aralıkta olmalı.','Each score must be within the specified range.'],
['100 üzerinden ağırlıklı puan','Weighted score out of 100'],['Girilen notların ortalaması','Average of entered scores'],
['Tüm ana kalemler girildi. ','All main components have been entered. '],['Yuvarlama öncesi sonuçtur. ','This is the unrounded result. '],['Harf notu ve özel koşulları ayrıca doğrula.','Confirm the letter grade and special conditions separately.'],
['Tüm ana notlara göre tahmin. ','Estimate based on all main scores. '],['Sadece girilen notların ortalamasına göre geçici tahmin; eksik notlar sonucu değiştirir. ','Provisional estimate based only on entered scores; missing scores will change the result. '],
['Başlangıç sınırları syllabus tablosuna dayanır; kesirli puanlar için yuvarlama belirsiz. ','Default thresholds are based on the syllabus; rounding of fractional scores is unclear. '],['Başlangıç sınırları örnek ölçektir; bu dersin resmî sınırları olarak doğrulanmamıştır. ','Default thresholds are an example scale and have not been verified as official for this course. '],['Çan, devam ve özel F/NA koşulları uygulanmaz.','Grading curves, attendance and special F/NA conditions are not applied.'],
['Sınırlar 0–100 arasında ve büyükten küçüğe olmalı.','Thresholds must be between 0 and 100 and in descending order.'],['Önce harf sınırlarını düzelt.','Correct the letter-grade thresholds first.'],
[' · tahmini not içeriyor',' · includes estimated grades'],['Dersi sil','Remove course'],['Örn. IF 100','e.g. IF 100'],['Seç','Select'],
['Bağımsız bir öğrenci aracıdır; üniversitenin resmî uygulaması değildir.','An independent student tool; not an official university application.'],
['Yayın tarihi','Published'],['Hazırlayan','Created by'],['Yapan','Created by']
];
pairs.sort((a,b)=>b[0].length-a[0].length);
function english(s){
 const matches=s.match(/^(\d+) ders bulundu$/);if(matches)return `${matches[1]} courses found`;
 if(s.trim()==='Not')return s.replace('Not','Score');
 const m=s.match(/^Şu ana kadar %(\d+(?:[.,]\d+)?) ağırlığında not girdin\. Eksik kalemler hesaba katılmaz; bonus yalnızca tüm ana kalemler girildiğinde eklenir\.$/);if(m)return `You have entered scores for ${m[1]}% of the course weight. Missing components are excluded; bonus points are added only when all main components are entered.`;
 const n=s.match(/^([\d.,]+) SU kredisi üzerinden( · tahmini not içeriyor)?$/);if(n)return `${n[1]} SU credits${n[2]?' · includes estimated grades':''}`;
 const w=s.match(/^Ağırlık %(\d+(?:[.,]\d+)?)$/);if(w)return `Weight ${w[1]}%`;
 const a=s.match(/^([ABCDF][+−]?) alt sınırı$/);if(a)return `${a[1]} minimum score`;
 let out=s;for(const [tr,en] of pairs){if(out.includes(tr))out=out.split(tr).join(en)}return out;
}
let language='tr';const texts=new WeakMap(), attrs=new WeakMap();let pending=false;
function renderText(node){let old=texts.get(node),current=node.nodeValue;if(!old||old.rendered!==current)old={original:current,rendered:current};let next=language==='en'?english(old.original):old.original;if(current!==next)node.nodeValue=next;old.rendered=next;texts.set(node,old)}
function renderAttr(el,key){let current=el.getAttribute(key);if(current===null)return;let state=attrs.get(el)||{};let old=state[key];if(!old||old.rendered!==current)old={original:current,rendered:current};let next=language==='en'?english(old.original):old.original;if(current!==next)el.setAttribute(key,next);old.rendered=next;state[key]=old;attrs.set(el,state)}
function render(){pending=false;document.documentElement.lang=language;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){return /^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement?.tagName||'')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});while(w.nextNode())renderText(w.currentNode);document.body.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{renderAttr(el,'placeholder');renderAttr(el,'aria-label')})}
function schedule(){if(!pending){pending=true;queueMicrotask(render)}}
window.suSetLanguage=function(lang){language=lang==='en'?'en':'tr';render()};window.suTranslationRefresh=render;
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label']});
})();
