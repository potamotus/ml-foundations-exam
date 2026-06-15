#!/usr/bin/env python3
# Append coverage-audit additions (<id>.gap.json) into <id>.json.
# Mechanical append only: existing content preserved; new items appended in order
# (so author-computed ref = K + local_index stays valid). Globs ONLY *.gap.json.
import json, glob, os
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
FIELDS = [('newTheory', 'theory'), ('newQuiz', 'quiz'), ('newOpen', 'open'), ('newCheat', 'cheat')]
problems = []
totals = {'theory': 0, 'quiz': 0, 'open': 0, 'cheat': 0}
for gf in sorted(glob.glob(TOP + '/*.gap.json')):
    tid = os.path.basename(gf)[:-len('.gap.json')]
    jf = os.path.join(TOP, tid + '.json')
    if not os.path.exists(jf):
        problems.append(f'{tid}: нет базового {tid}.json'); continue
    d = json.load(open(jf, encoding='utf-8'))
    g = json.load(open(gf, encoding='utf-8'))
    added = []
    for src, dst in FIELDS:
        items = g.get(src, []) or []
        d.setdefault(dst, []).extend(items)
        totals[dst] += len(items)
        added.append(f'{dst}+{len(items)}')
    # post-merge ref sanity
    nt = len(d['theory'])
    for i, q in enumerate(d.get('quiz', [])):
        r = q.get('ref')
        if r is not None and not (0 <= r < nt):
            problems.append(f'{tid} quiz[{i}]: ref {r} вне [0,{nt})')
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{tid:11} ' + '  '.join(added))
print('\nTOTAL added:', totals)
print('PROBLEMS:' if problems else 'no problems')
for p in problems:
    print('  !', p)
