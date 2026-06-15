#!/usr/bin/env python3
# Inject {{fig:ID}} into theory cards per <id>.figs.json. Validates figId against the known set.
import json, glob, os, re
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
KNOWN = {'sigmoid','roc','prcurve','confusion','calibration','biasvar','ucurve','lossmargin',
         'margin2d','margindist','bisector','gd1d','lrate','gdcontour','l1l2','varreduction',
         'boostresid','impurity','treepartition','xor','kmeans','elbow','dbscan','pca2d',
         'softmax','maehuber','mape'}
problems = []
total = 0
for ff in sorted(glob.glob(TOP + '/*.figs.json')):
    tid = os.path.basename(ff)[:-len('.figs.json')]
    jf = os.path.join(TOP, tid + '.json')
    d = json.load(open(jf, encoding='utf-8'))
    fj = json.load(open(ff, encoding='utf-8'))
    # strip any stale placeholders first (idempotent re-runs)
    for t in d['theory']:
        t['body'] = re.sub(r'\s*\{\{fig:[a-z0-9]+\}\}', '', t['body'])
    placed = 0
    for cf in fj.get('cardFigs', []):
        card, fig = cf.get('card'), cf.get('fig')
        if fig not in KNOWN:
            problems.append(f'{tid}: unknown figId "{fig}" (card {card})'); continue
        if not (isinstance(card, int) and 0 <= card < len(d['theory'])):
            problems.append(f'{tid}: bad card {card} for {fig}'); continue
        d['theory'][card]['body'] += '\n{{fig:%s}}' % fig
        placed += 1
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    total += placed
    print(f'{tid:11} placed {placed}/{len(d["theory"])} cards')
print(f'\nTOTAL figures placed: {total}')
print('PROBLEMS:' if problems else 'no problems')
for p in problems:
    print('  !', p)
