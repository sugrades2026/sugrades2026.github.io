/* Optional comparison model: every statistic and boundary is supplied by the student. */
(() => {
  'use strict';
  const root=document.querySelector('#models-tools');if(!root)return;
  const copy={
    tr:{title:'Sınıf ortalamasıyla karşılaştır',intro:'Kendi puanını, sınıf ortalamasını ve standart sapmayı gir. Bu yalnızca istatistiksel karşılaştırmadır; resmî harf notu değildir.',score:'Ders puanın (0–100)',mean:'Sınıf ortalaması (0–100)',sd:'Standart sapma',cuts:'İsteğe bağlı tahmini harf sınırları',help:'Öğretim üyesinin kullandığı sınırları biliyorsan A, B, C ve D için z-skoru alt sınırlarını gir. Bu basitleştirilmiş model artı ve eksi harfleri içermez; sınırlar ve çan yöntemi dersine uymayabilir.',wait:'Karşılaştırma için puan, ortalama ve standart sapmayı gir.',bad:'Puan ve ortalama 0–100, standart sapma sıfırdan büyük ve en fazla 100 olmalı.',partial:'Tahmini harf için dört sınırın tamamını gir.',order:'Sınırlar büyükten küçüğe A > B > C > D olmalı.',z:'Z-skorun',above:'Sınıf ortalamasının üzerindesin.',below:'Sınıf ortalamasının altındasın.',equal:'Sınıf ortalamasındasın.',letter:'Kendi sınırlarına göre tahmini harf'},
    en:{title:'Compare with the class average',intro:'Enter your score, class average and standard deviation. This is a statistical comparison, not an official letter grade.',score:'Your course score (0–100)',mean:'Class average (0–100)',sd:'Standard deviation',cuts:'Optional estimated grade boundaries',help:'If you know your instructor’s boundaries, enter the minimum z-score for A, B, C and D. This simplified model omits plus and minus grades; boundaries and grading methods may differ for your course.',wait:'Enter a score, average and standard deviation to compare.',bad:'Score and average must be 0–100; standard deviation must be greater than zero and no more than 100.',partial:'Enter all four boundaries to estimate a letter grade.',order:'Boundaries must descend: A > B > C > D.',z:'Your z-score',above:'Above the class average.',below:'Below the class average.',equal:'At the class average.',letter:'Estimated letter using your boundaries'}
  };
  const en=()=>document.documentElement.lang==='en',t=k=>copy[en()?'en':'tr'][k], bindings=[];
  const e=(tag,parent,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;parent.append(n);return n};
  const text=(tag,parent,key)=>{const n=e(tag,parent);bindings.push([n,key]);return n};
  const card=e('section',root,'planning-card');text('h2',card,'title');text('p',card,'intro');
  function input(key,min,max){const label=e('label',card);text('span',label,key);const i=e('input',label);i.type='number';i.step='any';i.inputMode='decimal';i.min=String(min);i.max=String(max);return i}
  const score=input('score',0,100),mean=input('mean',0,100),sd=input('sd',0,100);
  const details=e('details',card);text('summary',details,'cuts');text('p',details,'help');
  const thresholds=['A','B','C','D'].map(grade=>{const label=e('label',details);label.textContent=grade+' · z';const n=e('input',label);n.type='number';n.step='any';n.min='-10';n.max='10';n.inputMode='decimal';return n});
  const result=e('p',card,'planning-result');result.setAttribute('role','status');result.setAttribute('aria-live','polite');
  const val=n=>n.value.trim()===''?null:n.valueAsNumber;
  function update(){let [s,m,d]=[score,mean,sd].map(val);if([s,m,d].some(v=>v===null)){result.textContent=t('wait');return}if(![s,m,d].every(Number.isFinite)||s<0||s>100||m<0||m>100||d<=0||d>100){result.textContent=t('bad');return}const z=(s-m)/d, suffix=z>0?t('above'):z<0?t('below'):t('equal');let lines=[t('z')+': '+z.toFixed(2),suffix], boundaries=thresholds.map(val);if(boundaries.some(x=>x!==null)){if(boundaries.some(x=>x===null)){lines.push(t('partial'))}else if(boundaries.some(x=>!Number.isFinite(x)||x< -10||x>10)||!boundaries.every((x,i)=>i===0||boundaries[i-1]>x)){lines.push(t('order'))}else{const idx=boundaries.findIndex(x=>z>=x);lines.push(t('letter')+': '+(idx<0?'F':['A','B','C','D'][idx]))}}result.textContent=lines.join('\n')}
  function localize(){bindings.forEach(([node,key])=>node.textContent=t(key));update()}
  root.addEventListener('input',update);new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});localize();
})();
