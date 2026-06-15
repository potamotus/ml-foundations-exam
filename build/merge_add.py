#!/usr/bin/env python3
# Append transfer-gap additions (<id>.add.json) into <id>.json and apply quizFixes.
# Mechanical: existing content is preserved; new items appended; flagged quiz items replaced.
import json, glob, os
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
FIELDS = [('newTheory', 'theory'), ('newOpen', 'open'), ('newCheat', 'cheat'), ('newQuiz', 'quiz')]
problems = []
totals = {'theory': 0, 'quiz': 0, 'open': 0, 'cheat': 0, 'fixes': 0}
for af in sorted(glob.glob(TOP + '/*.add.json')):
    tid = os.path.basename(af)[:-len('.add.json')]
    jf = os.path.join(TOP, tid + '.json')
    d = json.load(open(jf, encoding='utf-8'))
    add = json.load(open(af, encoding='utf-8'))
    # apply quiz fixes first (indices refer to current quiz)
    for fx in add.get('quizFixes', []):
        i = fx.get('i')
        if i is None or not (0 <= i < len(d['quiz'])):
            problems.append(f'{tid}: quizFix bad index i={i}')
            continue
        d['quiz'][i] = {k: fx[k] for k in ('q', 'o', 'c', 'e', 'cat') if k in fx}
        totals['fixes'] += 1
    # append new items
    added = []
    for src, dst in FIELDS:
        items = add.get(src, []) or []
        d.setdefault(dst, []).extend(items)
        totals[dst] += len(items)
        added.append(f'{dst}+{len(items)}')
    json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{tid:11} ' + '  '.join(added) + f'  fixes:{len(add.get("quizFixes", []))}')
print('\nTOTAL added:', totals)
if problems:
    print('PROBLEMS:'); [print('  !', p) for p in problems]
else:
    print('no problems')
