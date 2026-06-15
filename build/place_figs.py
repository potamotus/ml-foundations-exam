#!/usr/bin/env python3
# Inject {{fig:ID}} placeholders into specific theory-card bodies (idempotent).
import json, os
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
PLACEMENTS = [
    ('logreg', 2, 'sigmoid'),
    ('metrics', 5, 'roc'),
    ('bagging', 1, 'biasvar'),
    ('knn', 5, 'ucurve'),
    ('losses', 6, 'lossmargin'),
    ('svm', 0, 'margin2d'),
    ('gd', 0, 'gd1d'),
    ('gd', 2, 'lrate'),
    ('regul', 5, 'l1l2'),
    ('trees', 1, 'impurity'),
    ('dimred', 8, 'pca2d'),
    ('clustering', 2, 'kmeans'),
    ('linreg', 7, 'maehuber'),
]
done = []
for tid, card, fig in PLACEMENTS:
    jf = os.path.join(TOP, tid + '.json')
    d = json.load(open(jf, encoding='utf-8'))
    if not (0 <= card < len(d['theory'])):
        print('!! bad card', tid, card); continue
    body = d['theory'][card]['body']
    tag = '{{fig:%s}}' % fig
    if tag in body:
        done.append('%s[%d] %s (already)' % (tid, card, fig)); continue
    d['theory'][card]['body'] = body + '\n' + tag
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    done.append('%s[%d] ← %s  (card: %s)' % (tid, card, fig, d['theory'][card]['ttl'][:42]))
print('\n'.join(done))
print('\nplaced', len([x for x in done if '←' in x]), 'figures')
