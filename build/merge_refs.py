#!/usr/bin/env python3
# Merge theory-card refs (<id>.refs.json) into quiz/open items (.ref). Mechanical.
import json, glob, os
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
problems = []
tot = {'quiz': 0, 'open': 0}
for rf in sorted(glob.glob(TOP + '/*.refs.json')):
    tid = os.path.basename(rf)[:-len('.refs.json')]
    jf = os.path.join(TOP, tid + '.json')
    d = json.load(open(jf, encoding='utf-8'))
    r = json.load(open(rf, encoding='utf-8'))
    qr, orf = r.get('quizRefs', []), r.get('openRefs', [])
    if len(qr) != len(d['quiz']):
        problems.append(f'{tid}: quizRefs {len(qr)} != quiz {len(d["quiz"])}')
    if len(orf) != len(d['open']):
        problems.append(f'{tid}: openRefs {len(orf)} != open {len(d["open"])}')
    qc = oc = 0
    for i, q in enumerate(d['quiz']):
        ref = qr[i] if i < len(qr) else -1
        if isinstance(ref, int) and 0 <= ref < len(d['theory']):
            q['ref'] = ref; qc += 1
    for i, q in enumerate(d['open']):
        ref = orf[i] if i < len(orf) else -1
        if isinstance(ref, int) and 0 <= ref < len(d['theory']):
            q['ref'] = ref; oc += 1
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    tot['quiz'] += qc; tot['open'] += oc
    print(f'{tid:11} quiz refs {qc}/{len(d["quiz"])}  open refs {oc}/{len(d["open"])}')
print('\nTOTAL refs:', tot)
print('PROBLEMS:' if problems else 'no problems')
for p in problems:
    print('  !', p)
