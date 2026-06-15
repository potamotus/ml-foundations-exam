#!/usr/bin/env python3
# Merge remapped explanations (<id>.enew.json) back into <id>.json — mechanical,
# so options[] and c cannot be altered. Only the `e` field of each quiz item changes.
import json, glob, os
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
problems = []
for ef in sorted(glob.glob(TOP + '/*.enew.json')):
    tid = os.path.basename(ef)[:-len('.enew.json')]
    jf = os.path.join(TOP, tid + '.json')
    d = json.load(open(jf, encoding='utf-8'))
    enew = json.load(open(ef, encoding='utf-8'))
    by_i = {rec['i']: rec['e'] for rec in enew}
    if len(enew) != len(d['quiz']):
        problems.append(f'{tid}: enew has {len(enew)} but quiz has {len(d["quiz"])}')
    cnt = 0
    for i, q in enumerate(d['quiz']):
        if i in by_i:
            q['e'] = by_i[i]; cnt += 1
        else:
            problems.append(f'{tid}: no remapped explanation for quiz[{i}]')
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{tid:11} merged {cnt}/{len(d["quiz"])}')
print('\nPROBLEMS:' if problems else '\nno problems')
for p in problems:
    print('  !', p)
