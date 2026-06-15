/* Self-contained SVG figures for theory cards. No deps. Exposes window.injectFigs / window.FIGS. */
(function(){
  var C={acc:'#5b8cff',ok:'#3fbf7f',err:'#ff6b6b',warn:'#f0b429',mut:'#9aa3b2',ln:'#2a2f3d',grid:'#222838',txt:'#cdd5e3',vio:'#b083f0'};
  function box(inner,cap,w,h){ return '<div class="fig"><svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'+(cap?'<div class="cap">'+cap+'</div>':'')+'</div>'; }
  function frame(cfg){
    var w=cfg.w,h=cfg.h,p={l:(cfg.pl||44),r:14,t:14,b:30};
    var iw=w-p.l-p.r, ih=h-p.t-p.b;
    var X=function(x){return p.l+(x-cfg.xmin)/(cfg.xmax-cfg.xmin)*iw;};
    var Y=function(y){return p.t+(cfg.ymax-y)/(cfg.ymax-cfg.ymin)*ih;};
    var s='';
    (cfg.xticks||[]).forEach(function(t){ s+='<line x1="'+X(t)+'" y1="'+p.t+'" x2="'+X(t)+'" y2="'+(p.t+ih)+'" stroke="'+C.grid+'"/>'; s+='<text x="'+X(t)+'" y="'+(p.t+ih+15)+'" fill="'+C.mut+'" font-size="10" text-anchor="middle">'+(cfg.xfmt?cfg.xfmt(t):t)+'</text>'; });
    (cfg.yticks||[]).forEach(function(t){ s+='<line x1="'+p.l+'" y1="'+Y(t)+'" x2="'+(p.l+iw)+'" y2="'+Y(t)+'" stroke="'+C.grid+'"/>'; s+='<text x="'+(p.l-6)+'" y="'+(Y(t)+3)+'" fill="'+C.mut+'" font-size="10" text-anchor="end">'+(cfg.yfmt?cfg.yfmt(t):t)+'</text>'; });
    if(cfg.ymin<0&&cfg.ymax>0) s+='<line x1="'+p.l+'" y1="'+Y(0)+'" x2="'+(p.l+iw)+'" y2="'+Y(0)+'" stroke="#3a4250"/>';
    if(cfg.xmin<0&&cfg.xmax>0) s+='<line x1="'+X(0)+'" y1="'+p.t+'" x2="'+X(0)+'" y2="'+(p.t+ih)+'" stroke="#3a4250"/>';
    s+='<line x1="'+p.l+'" y1="'+p.t+'" x2="'+p.l+'" y2="'+(p.t+ih)+'" stroke="#4a5160"/><line x1="'+p.l+'" y1="'+(p.t+ih)+'" x2="'+(p.l+iw)+'" y2="'+(p.t+ih)+'" stroke="#4a5160"/>';
    if(cfg.xlabel) s+='<text x="'+(p.l+iw)+'" y="'+(p.t+ih-5)+'" fill="'+C.mut+'" font-size="10" text-anchor="end">'+cfg.xlabel+'</text>';
    if(cfg.ylabel) s+='<text x="'+(p.l+4)+'" y="'+(p.t+9)+'" fill="'+C.mut+'" font-size="10">'+cfg.ylabel+'</text>';
    return {X:X,Y:Y,s:s,p:p,iw:iw,ih:ih};
  }
  function curve(fn,a,b,X,Y,color,dash){ var n=90,d=''; for(var i=0;i<=n;i++){ var x=a+(b-a)*i/n; d+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(fn(x)).toFixed(1)+' '; } return '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'; }
  function leg(items,x,y){ var s=''; items.forEach(function(it,i){ s+='<rect x="'+x+'" y="'+(y+i*15-8)+'" width="11" height="3.5" fill="'+it[1]+'"/><text x="'+(x+16)+'" y="'+(y+i*15-4)+'" fill="'+C.txt+'" font-size="10.5">'+it[0]+'</text>'; }); return s; }

  var FIGS={};

  FIGS.sigmoid=function(){ var f=frame({w:420,h:215,xmin:-6,xmax:6,ymin:-0.05,ymax:1.08,xticks:[-6,-3,0,3,6],yticks:[0,0.5,1],xlabel:'z=⟨w,x⟩'});
    var s=f.s; s+='<line x1="'+f.X(-6)+'" y1="'+f.Y(1)+'" x2="'+f.X(6)+'" y2="'+f.Y(1)+'" stroke="'+C.ln+'" stroke-dasharray="3 3"/>';
    s+=curve(function(z){return 1/(1+Math.exp(-z));},-6,6,f.X,f.Y,C.acc);
    s+='<circle cx="'+f.X(0)+'" cy="'+f.Y(0.5)+'" r="3" fill="'+C.warn+'"/><text x="'+(f.X(0)+5)+'" y="'+(f.Y(0.5)-5)+'" fill="'+C.warn+'" font-size="10">0.5 при z=0</text>';
    return box(s,'Сигмоида σ(z)=1/(1+e<sup>−z</sup>): сжимает любой ⟨w,x⟩ в (0,1); монотонна, σ(0)=0.5, асимптоты 0 и 1.',420,215); };

  FIGS.roc=function(){ var f=frame({w:300,h:255,xmin:0,xmax:1,ymin:0,ymax:1,xticks:[0,0.5,1],yticks:[0,0.5,1],xlabel:'FPR',ylabel:'TPR'});
    var pts=[[0,0],[0,0.55],[0.15,0.8],[0.4,0.93],[1,1]], s=f.s;
    var area=[[f.X(0),f.Y(0)]]; pts.forEach(function(q){area.push([f.X(q[0]),f.Y(q[1])]);}); area.push([f.X(1),f.Y(0)]);
    s+='<polygon points="'+area.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ')+'" fill="'+C.acc+'" opacity="0.13"/>';
    s+='<line x1="'+f.X(0)+'" y1="'+f.Y(0)+'" x2="'+f.X(1)+'" y2="'+f.Y(1)+'" stroke="'+C.mut+'" stroke-dasharray="4 4"/>';
    s+='<path d="'+pts.map(function(q,i){return (i?'L':'M')+f.X(q[0]).toFixed(1)+' '+f.Y(q[1]).toFixed(1);}).join(' ')+'" fill="none" stroke="'+C.acc+'" stroke-width="2.5"/>';
    s+='<text x="'+f.X(0.55)+'" y="'+f.Y(0.32)+'" fill="'+C.acc+'" font-size="12">AUC</text>';
    s+='<text x="'+f.X(0.62)+'" y="'+f.Y(0.72)+'" fill="'+C.mut+'" font-size="9">случайная</text>';
    return box(s,'ROC: доля верно пойманных «+» (TPR) против ложных тревог (FPR) при движении порога. Диагональ — случайная модель (AUC=0.5); идеал — угол (0,1).',300,255); };

  FIGS.biasvar=function(){ var f=frame({w:410,h:225,xmin:0,xmax:10,ymin:0,ymax:10,xlabel:'сложность модели →',ylabel:'ошибка'});
    var bias=function(x){return 9*Math.exp(-0.45*x)+0.3;}, varr=function(x){return 0.45+0.08*x*x;}, tot=function(x){return bias(x)+varr(x);}, s=f.s;
    s+=curve(bias,0,10,f.X,f.Y,C.ok); s+=curve(varr,0,10,f.X,f.Y,C.warn); s+=curve(tot,0,10,f.X,f.Y,C.acc);
    var bx=0,bv=1e9; for(var x=0;x<=10;x+=0.05){var v=tot(x); if(v<bv){bv=v;bx=x;}}
    s+='<line x1="'+f.X(bx)+'" y1="'+f.p.t+'" x2="'+f.X(bx)+'" y2="'+(f.p.t+f.ih)+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    s+='<text x="'+f.X(bx)+'" y="'+(f.p.t+10)+'" fill="'+C.mut+'" font-size="9" text-anchor="middle">оптимум</text>';
    s+=leg([['смещение²',C.ok],['разброс',C.warn],['суммарная',C.acc]],f.X(5.4),f.Y(9.3));
    return box(s,'Ошибка = шум + смещение² + разброс. Со сложностью смещение падает, разброс растёт → суммарная ошибка U-образная. Бэггинг снижает именно разброс.',410,225); };

  FIGS.ucurve=function(){ var f=frame({w:410,h:215,xmin:0,xmax:10,ymin:0,ymax:10,xlabel:'сложность (k→1) →',ylabel:'ошибка'});
    var tr=function(x){return 8.5*Math.exp(-0.55*x)+0.15;}, te=function(x){return 3.0*Math.exp(-0.8*x)+0.17*(x-2.2)*(x-2.2)+1.2;}, s=f.s;
    s+=curve(tr,0.2,10,f.X,f.Y,C.ok); s+=curve(te,0.2,10,f.X,f.Y,C.err);
    var bx=0,bv=1e9; for(var x=0.5;x<=10;x+=0.05){var v=te(x); if(v<bv){bv=v;bx=x;}}
    s+='<line x1="'+f.X(bx)+'" y1="'+f.p.t+'" x2="'+f.X(bx)+'" y2="'+(f.p.t+f.ih)+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    s+='<text x="'+f.X(0.8)+'" y="'+(f.p.t+12)+'" fill="'+C.mut+'" font-size="9">недообуч.</text><text x="'+f.X(9.2)+'" y="'+(f.p.t+12)+'" fill="'+C.mut+'" font-size="9" text-anchor="end">переобуч.</text>';
    s+=leg([['на обучении',C.ok],['на новых данных',C.err]],f.X(3.6),f.Y(9.4));
    return box(s,'U-кривража: рост сложности (k→1) обнуляет ошибку на обучении, но ошибка на новых данных сначала падает, затем растёт. Оптимальный k — в минимуме красной кривой.',410,215); };

  FIGS.lossmargin=function(){ var f=frame({w:430,h:235,xmin:-2,xmax:3,ymin:0,ymax:4,xticks:[-2,-1,0,1,2,3],yticks:[0,1,2,3,4],xlabel:'отступ M=y⟨w,x⟩',ylabel:'потеря'});
    var s=f.s;
    s+='<path d="M '+f.X(-2)+' '+f.Y(1)+' L '+f.X(0)+' '+f.Y(1)+' L '+f.X(0)+' '+f.Y(0)+' L '+f.X(3)+' '+f.Y(0)+'" fill="none" stroke="'+C.mut+'" stroke-width="2"/>';
    s+=curve(function(M){return Math.max(0,1-M);},-2,3,f.X,f.Y,C.acc);
    s+=curve(function(M){return Math.log2(1+Math.exp(-M));},-2,3,f.X,f.Y,C.ok);
    s+=curve(function(M){return Math.min(4,Math.exp(-M));},-2,3,f.X,f.Y,C.err);
    s+=leg([['0/1 индикатор',C.mut],['hinge (SVM)',C.acc],['логистическая',C.ok],['экспоненц.',C.err]],f.X(0.7),f.Y(3.9));
    return box(s,'Суррогаты — гладкие верхние оценки индикатора [M&lt;0]: убывают по отступу и «прижимаются» к нулю при M→+∞. Экспонента сильнее всех штрафует большой отрицательный отступ → чувствительна к выбросам.',430,235); };

  FIGS.margin2d=function(){ var w=360,h=255,s='';
    var pos=[[230,62],[270,92],[212,112],[292,128],[250,150]], neg=[[92,132],[132,160],[72,182],[152,198],[112,220]];
    s+='<line x1="62" y1="248" x2="338" y2="60" stroke="'+C.mut+'" stroke-width="1.3" stroke-dasharray="5 4"/>';
    s+='<line x1="22" y1="208" x2="298" y2="20" stroke="'+C.mut+'" stroke-width="1.3" stroke-dasharray="5 4"/>';
    s+='<line x1="42" y1="228" x2="318" y2="40" stroke="'+C.txt+'" stroke-width="2"/>';
    pos.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="5" fill="'+C.acc+'"/>';});
    neg.forEach(function(q){s+='<rect x="'+(q[0]-4)+'" y="'+(q[1]-4)+'" width="8" height="8" fill="'+C.err+'"/>';});
    s+='<circle cx="230" cy="62" r="8.5" fill="none" stroke="'+C.ok+'" stroke-width="2"/>';
    s+='<rect x="87" y="127" width="10" height="10" fill="none" stroke="'+C.ok+'" stroke-width="2"/>';
    s+='<text x="14" y="14" fill="'+C.ok+'" font-size="10">зелёным — опорные объекты (на границах зазора)</text>';
    s+='<text x="150" y="135" fill="'+C.txt+'" font-size="10" transform="rotate(-34 150 135)">разделяющая</text>';
    return box(s,'SVM выбирает гиперплоскость с МАКСИМАЛЬНЫМ зазором (полосой между классами). Ширину зазора задают ближайшие объекты — опорные векторы; остальные на решение не влияют.',w,h); };

  FIGS.gd1d=function(){ var f=frame({w:380,h:225,xmin:-3,xmax:3,ymin:-0.4,ymax:9,xticks:[-3,-2,-1,0,1,2,3],yticks:[0,3,6,9],xlabel:'w',ylabel:'Q(w)'});
    var Q=function(w){return w*w;}, s=f.s; s+=curve(Q,-3,3,f.X,f.Y,C.acc);
    var wt=2.6, eta=0.32, arr=[]; for(var i=0;i<7;i++){arr.push(wt); wt=wt-eta*2*wt;}
    for(var j=0;j<arr.length;j++){ var w=arr[j]; s+='<circle cx="'+f.X(w).toFixed(1)+'" cy="'+f.Y(Q(w)).toFixed(1)+'" r="3.4" fill="'+C.warn+'"/>';
      if(j>0){ var pw=arr[j-1]; s+='<line x1="'+f.X(pw).toFixed(1)+'" y1="'+f.Y(Q(pw)).toFixed(1)+'" x2="'+f.X(w).toFixed(1)+'" y2="'+f.Y(Q(w)).toFixed(1)+'" stroke="'+C.warn+'" stroke-width="1.2" stroke-dasharray="3 2"/>'; } }
    s+='<text x="'+f.X(2.6)+'" y="'+(f.Y(Q(2.6))-6)+'" fill="'+C.warn+'" font-size="10" text-anchor="middle">w⁰</text>';
    s+='<text x="'+f.X(0)+'" y="'+(f.Y(0)-7)+'" fill="'+C.ok+'" font-size="10" text-anchor="middle">минимум</text>';
    return box(s,'Шаг wᵗ⁺¹=wᵗ−η·∇Q идёт ПРОТИВ градиента (вниз по склону). У дна градиент мал → шаги укорачиваются и метод сходится к минимуму.',380,225); };

  FIGS.lrate=function(){ var w=470,h=185,s='';
    var panels=[{eta:0.12,t:'малый η: медленно',col:C.mut},{eta:0.42,t:'хороший η',col:C.ok},{eta:1.03,t:'большой η: расходится',col:C.err}];
    panels.forEach(function(pn,pi){ var ox=pi*152+14,oy=16,pw=128,ph=118;
      var X=function(x){return ox+(x+3)/6*pw;}, Y=function(y){return oy+(9-Math.min(y,9))/9*ph;}, Q=function(x){return x*x;};
      var d=''; for(var i=0;i<=40;i++){var x=-3+6*i/40; d+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(Q(x)).toFixed(1)+' ';}
      s+='<path d="'+d+'" fill="none" stroke="#3a4250" stroke-width="1.4"/>';
      var wt=2.6, arr=[]; for(var k=0;k<9;k++){arr.push(wt); wt=wt-pn.eta*2*wt; if(Math.abs(wt)>3.3)break;}
      for(var j=0;j<arr.length;j++){ var xx=arr[j]; if(Math.abs(xx)>3) continue;
        s+='<circle cx="'+X(xx).toFixed(1)+'" cy="'+Y(Q(xx)).toFixed(1)+'" r="2.6" fill="'+pn.col+'"/>';
        if(j>0&&Math.abs(arr[j-1])<=3){ s+='<line x1="'+X(arr[j-1]).toFixed(1)+'" y1="'+Y(Q(arr[j-1])).toFixed(1)+'" x2="'+X(xx).toFixed(1)+'" y2="'+Y(Q(xx)).toFixed(1)+'" stroke="'+pn.col+'" stroke-width="1" stroke-dasharray="2 2"/>'; } }
      s+='<text x="'+(ox+pw/2)+'" y="'+(oy+ph+24)+'" fill="'+pn.col+'" font-size="9.5" text-anchor="middle">'+pn.t+'</text>';
    });
    return box(s,'Темп η: малый — много мелких шагов (медленно); хороший — быстро к дну; слишком большой — перелёты через минимум и расходимость.',w,h); };

  FIGS.l1l2=function(){ var w=440,h=250,s='';
    function panel(ox,title,kind,col){ var cx=ox+78,cy=128,R=52,ux=cx+54,uy=cy-44;
      for(var k=1;k<=3;k++){ s+='<ellipse cx="'+ux+'" cy="'+uy+'" rx="'+(k*24)+'" ry="'+(k*15)+'" transform="rotate(-25 '+ux+' '+uy+')" fill="none" stroke="#333b4c" stroke-width="1"/>'; }
      s+='<circle cx="'+ux+'" cy="'+uy+'" r="2.5" fill="'+C.mut+'"/><text x="'+(ux+5)+'" y="'+(uy-4)+'" fill="'+C.mut+'" font-size="9">МНК-оптимум</text>';
      s+='<line x1="'+cx+'" y1="'+(cy-R-14)+'" x2="'+cx+'" y2="'+(cy+R+14)+'" stroke="#4a5160"/><line x1="'+(cx-R-14)+'" y1="'+cy+'" x2="'+(cx+R+20)+'" y2="'+cy+'" stroke="#4a5160"/>';
      s+='<text x="'+cx+'" y="'+(cy-R-18)+'" fill="'+C.mut+'" font-size="9" text-anchor="middle">w₂</text><text x="'+(cx+R+22)+'" y="'+(cy+4)+'" fill="'+C.mut+'" font-size="9">w₁</text>';
      if(kind==='l2'){ s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="'+col+'" opacity="0.12" stroke="'+col+'" stroke-width="2"/>';
        var a=-0.72; s+='<circle cx="'+(cx+R*Math.cos(a)).toFixed(1)+'" cy="'+(cy+R*Math.sin(a)).toFixed(1)+'" r="4" fill="'+col+'"/>'; }
      else { s+='<polygon points="'+cx+','+(cy-R)+' '+(cx+R)+','+cy+' '+cx+','+(cy+R)+' '+(cx-R)+','+cy+'" fill="'+col+'" opacity="0.12" stroke="'+col+'" stroke-width="2"/>';
        s+='<circle cx="'+cx+'" cy="'+(cy-R)+'" r="4.5" fill="'+col+'"/><text x="'+(cx+6)+'" y="'+(cy-R+2)+'" fill="'+col+'" font-size="9">w₁=0</text>'; }
      s+='<text x="'+cx+'" y="'+(cy+R+32)+'" fill="'+col+'" font-size="11" text-anchor="middle">'+title+'</text>';
    }
    panel(8,'L2 (Ridge): круг','l2',C.acc); panel(228,'L1 (LASSO): ромб','l1',C.ok);
    return box(s,'Линии уровня MSE «дотягиваются» до области ограничения ‖w‖. У L1 (ромб) касание часто приходится на УГОЛ — на оси → вес зануляется (отбор признаков). У L2 (круг) углов нет → оба веса обычно ненулевые.',w,h); };

  FIGS.impurity=function(){ var f=frame({w:380,h:215,xmin:0,xmax:1,ymin:0,ymax:1.05,xticks:[0,0.5,1],yticks:[0,0.5,1],xlabel:'доля «+» в узле, p',ylabel:'impurity'});
    var ent=function(p){return (p<=0||p>=1)?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));}, gini=function(p){return 2*p*(1-p);}, s=f.s;
    s+=curve(ent,0.0001,0.9999,f.X,f.Y,C.acc); s+=curve(gini,0,1,f.X,f.Y,C.ok);
    s+='<line x1="'+f.X(0.5)+'" y1="'+f.p.t+'" x2="'+f.X(0.5)+'" y2="'+(f.p.t+f.ih)+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    s+=leg([['энтропия',C.acc],['Джини·2',C.ok]],f.X(0.07),f.Y(1.02));
    return box(s,'Impurity максимальна при p=0.5 (классы перемешаны) и =0 в чистом узле (p=0 или 1). Сплит выбирают так, чтобы максимально снизить взвешенную impurity детей.',380,215); };

  FIGS.pca2d=function(){ var w=320,h=255,s='',cx=160,cy=125,ang=-0.5,ca=Math.cos(ang),sa=Math.sin(ang);
    var rnd=[[2.0,0.3],[-1.5,-0.2],[1.0,-0.4],[-0.8,0.5],[2.5,0.1],[-2.2,0.3],[0.4,-0.3],[1.7,0.4],[-1.1,-0.5],[0.1,0.2],[-2.6,-0.1],[2.2,-0.3],[0.8,0.5],[-0.4,-0.4],[1.3,-0.15]];
    rnd.forEach(function(q){ var x=q[0]*40,y=q[1]*40,rx=x*ca-y*sa,ry=x*sa+y*ca; s+='<circle cx="'+(cx+rx).toFixed(1)+'" cy="'+(cy+ry).toFixed(1)+'" r="3.5" fill="'+C.acc+'"/>'; });
    var L=112,l=44;
    s+='<line x1="'+(cx-L*ca)+'" y1="'+(cy-L*sa)+'" x2="'+(cx+L*ca)+'" y2="'+(cy+L*sa)+'" stroke="'+C.warn+'" stroke-width="2.5"/><text x="'+(cx+L*ca+4)+'" y="'+(cy+L*sa)+'" fill="'+C.warn+'" font-size="11">PC1</text>';
    s+='<line x1="'+(cx+l*sa)+'" y1="'+(cy-l*ca)+'" x2="'+(cx-l*sa)+'" y2="'+(cy+l*ca)+'" stroke="'+C.ok+'" stroke-width="2.5"/><text x="'+(cx-l*sa-2)+'" y="'+(cy+l*ca+12)+'" fill="'+C.ok+'" font-size="11">PC2</text>';
    return box(s,'PCA ищет ось максимального разброса (PC1) — вдоль неё дисперсия наибольшая; PC2 ⟂ PC1 ловит остаток. Проекция на PC1 сохраняет больше всего информации.',w,h); };

  FIGS.kmeans=function(){ var w=320,h=235,s='';
    var cl=[{c:[82,80],col:C.acc,pts:[[60,62],[97,72],[76,102],[100,95],[66,86]]},
            {c:[232,72],col:C.ok,pts:[[212,56],[252,62],[236,96],[216,90],[256,86]]},
            {c:[162,178],col:C.warn,pts:[[142,164],[182,170],[156,200],[176,194],[150,180]]}];
    cl.forEach(function(g){ g.pts.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="4" fill="'+g.col+'" opacity="0.85"/>';});
      s+='<circle cx="'+g.c[0]+'" cy="'+g.c[1]+'" r="9" fill="none" stroke="#fff" stroke-width="2"/><path d="M '+(g.c[0]-5)+' '+(g.c[1]-5)+' L '+(g.c[0]+5)+' '+(g.c[1]+5)+' M '+(g.c[0]+5)+' '+(g.c[1]-5)+' L '+(g.c[0]-5)+' '+(g.c[1]+5)+'" stroke="#fff" stroke-width="2"/>'; });
    return box(s,'K-Means чередует два шага: (1) каждую точку приписать к ближайшему центру, (2) центр пересчитать как среднее своего кластера — до сходимости. ✕ — центроиды.',w,h); };

  FIGS.maehuber=function(){ var f=frame({w:400,h:225,xmin:-3,xmax:3,ymin:0,ymax:5,xticks:[-3,-2,-1,0,1,2,3],yticks:[0,1,2,3,4,5],xlabel:'остаток r = a(x)−y',ylabel:'потеря'});
    var d=1,s=f.s;
    s+=curve(function(r){return Math.min(5,r*r);},-3,3,f.X,f.Y,C.err);
    s+=curve(function(r){return Math.abs(r);},-3,3,f.X,f.Y,C.ok);
    s+=curve(function(r){return Math.abs(r)<=d?0.5*r*r:d*(Math.abs(r)-0.5*d);},-3,3,f.X,f.Y,C.acc);
    s+=leg([['MSE (r²)',C.err],['MAE (|r|)',C.ok],['Хубер',C.acc]],f.X(-2.85),f.Y(5));
    return box(s,'MSE растёт квадратично → сильно штрафует выбросы; MAE линейна (устойчивее, но не гладкая в нуле); Хубер квадратичен у нуля и линеен на хвостах — компромисс.',400,225); };

  FIGS.mape=function(){ var f=frame({w:420,h:225,xmin:0,xmax:5,ymin:0,ymax:3,xticks:[0,1,2,3,4,5],yticks:[0,1,2,3],xlabel:'прогноз a (истина y=1)',ylabel:'потеря'});
    var y=1,s=f.s;
    s+='<line x1="'+f.X(0)+'" y1="'+f.Y(1)+'" x2="'+f.X(5)+'" y2="'+f.Y(1)+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    s+='<line x1="'+f.X(0)+'" y1="'+f.Y(2)+'" x2="'+f.X(5)+'" y2="'+f.Y(2)+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    s+=curve(function(a){return Math.min(3,Math.abs(a-y)/y);},0,5,f.X,f.Y,C.err);
    s+=curve(function(a){return Math.abs(a-y)/((Math.abs(a)+Math.abs(y))/2);},0,5,f.X,f.Y,C.ok);
    s+='<circle cx="'+f.X(1)+'" cy="'+f.Y(0)+'" r="3" fill="'+C.warn+'"/><text x="'+(f.X(1)+4)+'" y="'+(f.Y(0)-4)+'" fill="'+C.warn+'" font-size="9">a=y</text>';
    s+=leg([['MAPE=|a−y|/y',C.err],['SMAPE (≤2)',C.ok]],f.X(2.1),f.Y(2.85));
    return box(s,'Недопрогноз (a→0) даёт MAPE максимум 1, а перепрогноз (a→∞) — без предела → асимметрия, занижение штрафуется мягче. SMAPE симметричнее и ограничена сверху 2 (пунктир).',420,225); };

  FIGS.prcurve=function(){ var f=frame({w:300,h:250,xmin:0,xmax:1,ymin:0,ymax:1.02,xticks:[0,0.5,1],yticks:[0,0.5,1],xlabel:'Recall (полнота)',ylabel:'Precision'});
    var pts=[[0,1],[0.3,0.95],[0.6,0.85],[0.8,0.65],[1,0.42]],s=f.s;
    s+='<path d="'+pts.map(function(q,i){return (i?'L':'M')+f.X(q[0]).toFixed(1)+' '+f.Y(q[1]).toFixed(1);}).join(' ')+'" fill="none" stroke="'+C.acc+'" stroke-width="2.5"/>';
    s+='<line x1="'+f.X(0)+'" y1="'+f.Y(0.2)+'" x2="'+f.X(1)+'" y2="'+f.Y(0.2)+'" stroke="'+C.mut+'" stroke-dasharray="4 4"/><text x="'+f.X(0.4)+'" y="'+(f.Y(0.2)-4)+'" fill="'+C.mut+'" font-size="9">доля «+» (база)</text>';
    return box(s,'PR-кривая: точность против полноты при движении порога. Рост полноты обычно роняет точность. На сильном дисбалансе она информативнее ROC; база = доля положительных.',300,250); };

  FIGS.confusion=function(){ var w=320,h=205,s='',x0=112,y0=42,c=82;
    s+='<text x="'+(x0+c)+'" y="20" fill="'+C.mut+'" font-size="11" text-anchor="middle">предсказание</text>';
    s+='<text x="'+(x0+c*0.5)+'" y="38" fill="'+C.ok+'" font-size="11" text-anchor="middle">+</text><text x="'+(x0+c*1.5)+'" y="38" fill="'+C.err+'" font-size="11" text-anchor="middle">−</text>';
    s+='<text x="'+(x0-40)+'" y="'+(y0+c)+'" fill="'+C.mut+'" font-size="11" text-anchor="middle" transform="rotate(-90 '+(x0-40)+' '+(y0+c)+')">истина</text>';
    s+='<text x="'+(x0-10)+'" y="'+(y0+c*0.5+4)+'" fill="'+C.ok+'" font-size="11" text-anchor="end">+</text><text x="'+(x0-10)+'" y="'+(y0+c*1.5+4)+'" fill="'+C.err+'" font-size="11" text-anchor="end">−</text>';
    var cells=[['TP',C.ok,0,0],['FN',C.err,1,0],['FP',C.err,0,1],['TN',C.ok,1,1]];
    cells.forEach(function(cl){ var cx=x0+cl[2]*c, cy=y0+cl[3]*c; s+='<rect x="'+cx+'" y="'+cy+'" width="'+c+'" height="'+c+'" fill="'+cl[1]+'" opacity="0.16" stroke="'+C.ln+'"/><text x="'+(cx+c/2)+'" y="'+(cy+c/2+6)+'" fill="'+cl[1]+'" font-size="17" font-weight="bold" text-anchor="middle">'+cl[0]+'</text>'; });
    return box(s,'Матрица ошибок: строки — истина, столбцы — предсказание. Диагональ TP/TN — верно; FP — ложная тревога, FN — пропуск «+». Из неё считают precision, recall, accuracy.',w,h); };

  FIGS.calibration=function(){ var f=frame({w:280,h:248,xmin:0,xmax:1,ymin:0,ymax:1,xticks:[0,0.5,1],yticks:[0,0.5,1],xlabel:'предсказанная p',ylabel:'факт. доля «+»'});
    var s=f.s; s+='<line x1="'+f.X(0)+'" y1="'+f.Y(0)+'" x2="'+f.X(1)+'" y2="'+f.Y(1)+'" stroke="'+C.ok+'" stroke-dasharray="4 4"/><text x="'+f.X(0.55)+'" y="'+f.Y(0.48)+'" fill="'+C.ok+'" font-size="9">идеал</text>';
    var pts=[[0.1,0.04],[0.3,0.17],[0.5,0.4],[0.7,0.73],[0.9,0.93]];
    s+='<path d="'+pts.map(function(q,i){return (i?'L':'M')+f.X(q[0]).toFixed(1)+' '+f.Y(q[1]).toFixed(1);}).join(' ')+'" fill="none" stroke="'+C.acc+'" stroke-width="2"/>';
    pts.forEach(function(q){s+='<circle cx="'+f.X(q[0])+'" cy="'+f.Y(q[1])+'" r="3" fill="'+C.acc+'"/>';});
    return box(s,'Калибровка: среди объектов с p≈0.7 доля реально положительных тоже ≈0.7 → точки на диагонали. Отклонение = модель «врёт» в вероятностях, даже если ранжирование (AUC) хорошее.',280,248); };

  FIGS.elbow=function(){ var f=frame({w:360,h:205,xmin:1,xmax:8,ymin:0,ymax:10,xticks:[1,2,3,4,5,6,7,8],yticks:[0,5,10],xlabel:'число кластеров K',ylabel:'J(C)'});
    var J=function(k){return 9.5*Math.exp(-0.7*(k-1))+0.6;},s=f.s,pts=[];
    for(var k=1;k<=8;k++) pts.push([k,J(k)]);
    s+='<path d="'+pts.map(function(q,i){return (i?'L':'M')+f.X(q[0]).toFixed(1)+' '+f.Y(q[1]).toFixed(1);}).join(' ')+'" fill="none" stroke="'+C.acc+'" stroke-width="2"/>';
    pts.forEach(function(q){s+='<circle cx="'+f.X(q[0])+'" cy="'+f.Y(q[1])+'" r="3" fill="'+C.acc+'"/>';});
    s+='<circle cx="'+f.X(3)+'" cy="'+f.Y(J(3))+'" r="7" fill="none" stroke="'+C.warn+'" stroke-width="2"/><text x="'+(f.X(3)+8)+'" y="'+(f.Y(J(3))-6)+'" fill="'+C.warn+'" font-size="10">локоть</text>';
    return box(s,'J(C) монотонно падает с ростом K (при K=ℓ → 0), поэтому минимум бесполезен как критерий. «Локоть» — где выигрыш резко замедляется; его берут за разумное K.',360,205); };

  FIGS.dbscan=function(){ var w=320,h=205,s='';
    var core=[[88,92],[120,80],[108,122],[150,100],[140,142]], border=[[172,82],[176,140]], noise=[[252,60],[272,158]];
    s+='<circle cx="88" cy="92" r="34" fill="'+C.acc+'" opacity="0.08" stroke="'+C.acc+'" stroke-dasharray="3 3"/>';
    core.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="6" fill="'+C.acc+'"/>';});
    border.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="5" fill="none" stroke="'+C.warn+'" stroke-width="2"/>';});
    noise.forEach(function(q){s+='<path d="M '+(q[0]-4)+' '+(q[1]-4)+' L '+(q[0]+4)+' '+(q[1]+4)+' M '+(q[0]+4)+' '+(q[1]-4)+' L '+(q[0]-4)+' '+(q[1]+4)+'" stroke="'+C.err+'" stroke-width="2"/>';});
    s+=leg([['core (≥minPts в eps)',C.acc],['border (рядом с core)',C.warn],['noise (выброс)',C.err]],182,86);
    return box(s,'DBSCAN: core имеет ≥ minPts соседей в радиусе eps; border попадает в окрестность core, но сам не плотный; noise — ни то, ни другое. Кластеры растут только через core-точки.',w,h); };

  FIGS.treepartition=function(){ var w=300,h=215,s='',x0=30,y0=18,W=240,H=160;
    s+='<rect x="'+x0+'" y="'+y0+'" width="'+W+'" height="'+H+'" fill="none" stroke="#4a5160"/>';
    s+='<line x1="130" y1="'+y0+'" x2="130" y2="'+(y0+H)+'" stroke="'+C.warn+'" stroke-width="1.6"/>';
    s+='<line x1="'+x0+'" y1="98" x2="130" y2="98" stroke="'+C.warn+'" stroke-width="1.6"/>';
    s+='<line x1="130" y1="118" x2="'+(x0+W)+'" y2="118" stroke="'+C.warn+'" stroke-width="1.6"/>';
    s+='<text x="80" y="62" fill="'+C.acc+'" font-size="14" text-anchor="middle">c₁</text><text x="80" y="142" fill="'+C.ok+'" font-size="14" text-anchor="middle">c₂</text>';
    s+='<text x="200" y="73" fill="'+C.err+'" font-size="14" text-anchor="middle">c₃</text><text x="200" y="152" fill="'+C.vio+'" font-size="14" text-anchor="middle">c₄</text>';
    s+='<text x="'+(x0+W)+'" y="'+(y0+H+15)+'" fill="'+C.mut+'" font-size="10" text-anchor="end">x₁</text><text x="'+(x0-6)+'" y="'+(y0+8)+'" fill="'+C.mut+'" font-size="10" text-anchor="end">x₂</text>';
    return box(s,'Дерево режет пространство на ОСЕ-ПАРАЛЛЕЛЬНЫЕ прямоугольники, в каждом листе — константа cⱼ. Прогноз a(x)=Σcⱼ[x∈Rⱼ] кусочно-постоянный → дерево не экстраполирует за пределы обучения.',w,h); };

  FIGS.boostresid=function(){ var w=420,h=180,s='';
    var panels=[{t:'a₀ (константа)',n:0},{t:'+ b₁',n:1},{t:'+ b₂ … → цель',n:2}];
    panels.forEach(function(pn,pi){ var ox=pi*138+14,oy=14,pw=120,ph=112;
      var X=function(x){return ox+(x/10)*pw;}, Y=function(y){return oy+ph-((y-1)/8)*ph;}, tgt=function(x){return 5+3*Math.sin(x*0.62);};
      var d=''; for(var i=0;i<=20;i++){var x=i*0.5; d+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(tgt(x)).toFixed(1)+' ';}
      s+='<path d="'+d+'" fill="none" stroke="'+C.mut+'" stroke-width="1.4"/>';
      var amp=[0,1.6,2.8][pn.n], fit=function(x){return 5+amp*Math.sin(x*0.62);}, d2='';
      for(var j=0;j<=20;j++){var x2=j*0.5; d2+=(j?'L':'M')+X(x2).toFixed(1)+' '+Y(fit(x2)).toFixed(1)+' ';}
      s+='<path d="'+d2+'" fill="none" stroke="'+C.acc+'" stroke-width="2"/>';
      s+='<text x="'+(ox+pw/2)+'" y="'+(oy+ph+20)+'" fill="'+C.txt+'" font-size="9.5" text-anchor="middle">'+pn.t+'</text>';
    });
    return box(s,'Бустинг строит композицию ПОСЛЕДОВАТЕЛЬНО: каждая новая модель bₙ дотягивает прогноз там, где сумма предыдущих ошиблась (учится на антиградиент / остатки). Серое — цель, синее — текущая сумма.',w,h); };

  FIGS.gdcontour=function(){ var w=440,h=215,s='',cx=95,cy=108;
    for(var k=1;k<=3;k++) s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(k*30)+'" ry="'+(k*11)+'" fill="none" stroke="#333b4c"/>';
    var zz=[[cx+78,cy-26],[cx-40,cy+14],[cx+34,cy-9],[cx-16,cy+6],[cx+10,cy-3],[cx,cy]];
    s+='<path d="'+zz.map(function(q,i){return (i?'L':'M')+q[0]+' '+q[1];}).join(' ')+'" fill="none" stroke="'+C.err+'" stroke-width="1.8"/>';
    zz.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="2.3" fill="'+C.err+'"/>';});
    s+='<text x="'+cx+'" y="'+(cy+72)+'" fill="'+C.err+'" font-size="10" text-anchor="middle">без масштаба: зигзаг</text>';
    var cx2=320,cy2=108; for(var k2=1;k2<=3;k2++) s+='<circle cx="'+cx2+'" cy="'+cy2+'" r="'+(k2*22)+'" fill="none" stroke="#333b4c"/>';
    var st=[[cx2+50,cy2-40],[cx2+30,cy2-24],[cx2+16,cy2-13],[cx2+7,cy2-5],[cx2,cy2]];
    s+='<path d="'+st.map(function(q,i){return (i?'L':'M')+q[0]+' '+q[1];}).join(' ')+'" fill="none" stroke="'+C.ok+'" stroke-width="1.8"/>';
    st.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="2.3" fill="'+C.ok+'"/>';});
    s+='<text x="'+cx2+'" y="'+(cy2+72)+'" fill="'+C.ok+'" font-size="10" text-anchor="middle">после стандартизации</text>';
    return box(s,'Разномасштабные признаки дают вытянутые эллипсы линий уровня → антиградиент идёт поперёк «оврага» → зигзаг и медленно. Стандартизация делает контуры круглыми — спуск идёт прямо к минимуму.',w,h); };

  FIGS.xor=function(){ var w=240,h=215,s='',x0=30,y0=18,W=180,H=160;
    s+='<rect x="'+x0+'" y="'+y0+'" width="'+W+'" height="'+H+'" fill="none" stroke="#4a5160"/>';
    var pos=[[70,55],[88,72],[160,140],[178,124]], neg=[[160,55],[178,72],[70,140],[88,124]];
    pos.forEach(function(q){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="5" fill="'+C.acc+'"/>';});
    neg.forEach(function(q){s+='<rect x="'+(q[0]-4)+'" y="'+(q[1]-4)+'" width="8" height="8" fill="'+C.err+'"/>';});
    s+='<line x1="120" y1="'+y0+'" x2="120" y2="'+(y0+H)+'" stroke="'+C.warn+'" stroke-dasharray="4 3"/><line x1="'+x0+'" y1="98" x2="'+(x0+W)+'" y2="98" stroke="'+C.warn+'" stroke-dasharray="4 3"/>';
    return box(s,'XOR: классы по диагоналям. ЛЮБОЙ одиночный порог по x₁ или x₂ делит каждый класс пополам и НЕ снижает impurity → жадное дерево «слепо» на первом шаге, хотя пара признаков разделяет идеально.',w,h); };

  FIGS.softmax=function(){ var w=320,h=200,s='',x0=42,bw=48,gap=26,base=158;
    var vals=[2.0,1.0,0.1,-0.5], ex=vals.map(function(v){return Math.exp(v);}), sm=ex.reduce(function(a,b){return a+b;}), pr=ex.map(function(e){return e/sm;});
    var labels=['класс 1','класс 2','класс 3','класс 4'];
    pr.forEach(function(p,i){ var bx=x0+i*(bw+gap), bh=p*118; s+='<rect x="'+bx+'" y="'+(base-bh).toFixed(1)+'" width="'+bw+'" height="'+bh.toFixed(1)+'" fill="'+C.acc+'" opacity="0.82"/>';
      s+='<text x="'+(bx+bw/2)+'" y="'+(base-bh-5).toFixed(1)+'" fill="'+C.txt+'" font-size="11" text-anchor="middle">'+p.toFixed(2)+'</text>';
      s+='<text x="'+(bx+bw/2)+'" y="'+(base+15)+'" fill="'+C.mut+'" font-size="9" text-anchor="middle">'+labels[i]+'</text>'; });
    s+='<text x="'+x0+'" y="18" fill="'+C.mut+'" font-size="10">softmax(z)ₖ = e^{zₖ} / Σⱼ e^{zⱼ}   (Σ = 1)</text>';
    return box(s,'Softmax превращает логиты zₖ=⟨wₖ,x⟩ в вероятности: экспонента + нормировка на сумму → все ≥0 и в сумме дают 1. Бинарная сигмоида — частный случай для двух классов.',w,h); };

  FIGS.margindist=function(){ var w=300,h=200,s='';
    s+='<line x1="40" y1="172" x2="272" y2="42" stroke="'+C.txt+'" stroke-width="2"/><text x="248" y="60" fill="'+C.txt+'" font-size="10">⟨w,x⟩=0</text>';
    var px=205,py=152; s+='<circle cx="'+px+'" cy="'+py+'" r="5" fill="'+C.acc+'"/><text x="'+(px+6)+'" y="'+(py+4)+'" fill="'+C.acc+'" font-size="12">x</text>';
    s+='<line x1="'+px+'" y1="'+py+'" x2="160" y2="93" stroke="'+C.warn+'" stroke-dasharray="4 3" stroke-width="1.6"/><text x="178" y="132" fill="'+C.warn+'" font-size="10">|⟨w,x⟩|/‖w‖</text>';
    s+='<line x1="158" y1="106" x2="124" y2="62" stroke="'+C.ok+'" stroke-width="1.8"/><text x="113" y="58" fill="'+C.ok+'" font-size="12">w</text>';
    return box(s,'Расстояние от точки до разделяющей гиперплоскости = |⟨w,x⟩|/‖w‖. Вектор w перпендикулярен гиперплоскости; |отступа| растёт с удалением — это «уверенность» классификатора.',w,h); };

  FIGS.varreduction=function(){ var f=frame({w:370,h:200,xmin:1,xmax:20,ymin:0,ymax:1.05,xticks:[1,5,10,15,20],yticks:[0,0.5,1],xlabel:'число моделей N',ylabel:'разброс (норм.)'});
    var s=f.s; s+=curve(function(N){return 1/N;},1,20,f.X,f.Y,C.acc); s+=curve(function(N){return 0.3+0.7/N;},1,20,f.X,f.Y,C.warn);
    s+='<line x1="'+f.X(1)+'" y1="'+f.Y(0.3)+'" x2="'+f.X(20)+'" y2="'+f.Y(0.3)+'" stroke="'+C.warn+'" stroke-dasharray="2 3"/>';
    s+=leg([['независимые: 1/N',C.acc],['коррелир.: ρ+(1−ρ)/N',C.warn]],f.X(6.5),f.Y(1.0));
    return box(s,'Усреднение N моделей: при НЕЗАВИСИМЫХ ошибках разброс падает в N раз (1/N→0). При корреляции ρ предел = ρ (пунктир) → случайный лес декоррелирует деревья рандомизацией признаков.',370,200); };

  FIGS.bisector=function(){ var w=280,h=200,s='',a=[88,132],b=[202,80];
    s+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+C.mut+'" stroke-dasharray="3 3"/>';
    var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=52,dy=114,L=0.62;
    s+='<line x1="'+(mx-dx*L)+'" y1="'+(my-dy*L)+'" x2="'+(mx+dx*L)+'" y2="'+(my+dy*L)+'" stroke="'+C.warn+'" stroke-width="2"/>';
    s+='<circle cx="'+a[0]+'" cy="'+a[1]+'" r="6" fill="'+C.acc+'"/><text x="'+(a[0]-16)+'" y="'+(a[1]+4)+'" fill="'+C.acc+'" font-size="12">x₁</text>';
    s+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="6" fill="'+C.err+'"/><text x="'+(b[0]+8)+'" y="'+(b[1]+4)+'" fill="'+C.err+'" font-size="12">x₂</text>';
    s+='<text x="'+(mx+dx*L+4)+'" y="'+(my+dy*L-2)+'" fill="'+C.warn+'" font-size="9">граница 1-NN</text>';
    return box(s,'Граница 1-NN между двумя точками — серединный перпендикуляр к отрезку (геом. место равноудалённых точек). При сравнении квадратов расстояний квадраты координат сокращаются → граница ЛИНЕЙНА.',w,h); };

  function injectFigs(html){ return (html||'').replace(/\{\{fig:([a-z0-9]+)\}\}/g, function(m,id){ return FIGS[id]?FIGS[id]():''; }); }
  window.FIGS=FIGS; window.injectFigs=injectFigs;
})();
