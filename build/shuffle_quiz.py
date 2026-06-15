#!/usr/bin/env python3
# Shuffle MCQ option positions (balanced) and record letterMap for explanation remap.
# Python owns options[] and c (safe). Agents will rewrite the `e` field using the maps.
import json, glob, random, hashlib, os
from collections import Counter

TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'

def seeded(s):
    return random.Random(int(hashlib.md5(s.encode()).hexdigest(), 16))

def balanced_targets(n_items, n_opts, rng):
    # each option position appears ~equally as the correct slot, order shuffled (no visible cycle)
    base = [k % n_opts for k in range(n_items)]
    rng.shuffle(base)
    return base

overall_before = Counter(); overall_after = Counter()
for f in sorted(glob.glob(os.path.join(TOP, '*.json'))):
    if '.verify.' in f or '.perm.' in f:
        continue
    tid = os.path.basename(f)[:-5]
    d = json.load(open(f, encoding='utf-8'))
    trng = seeded('targets#' + tid)
    quiz = d['quiz']
    # targets only meaningful if all 4-option; compute per-n on the fly but keep balance per topic
    targets = balanced_targets(len(quiz), 4, trng)
    recs = []
    for i, q in enumerate(quiz):
        o = q['o']; c = q['c']; n = len(o)
        overall_before[c] += 1
        rng = seeded(tid + '#' + str(i))
        target = targets[i] % n  # desired NEW position of the correct option
        others = [k for k in range(n) if k != c]
        rng.shuffle(others)
        new_order = [None] * n           # new_order[newpos] = old index
        new_order[target] = c
        oi = 0
        for pos in range(n):
            if pos == target:
                continue
            new_order[pos] = others[oi]; oi += 1
        new_o = [o[new_order[pos]] for pos in range(n)]
        new_c = target
        # letterMap: OLD letter -> NEW letter (old index k now sits at new_order.index(k))
        letterMap = {chr(65 + k): chr(65 + new_order.index(k)) for k in range(n)}
        recs.append({
            'i': i,
            'q': q.get('q', '')[:160],
            'letterMap': letterMap,
            'correctOld': chr(65 + c),
            'correctNew': chr(65 + new_c),
            'e_old': q.get('e', ''),
            'options_new': [{'L': chr(65 + pos), 't': new_o[pos]} for pos in range(n)],
        })
        q['o'] = new_o; q['c'] = new_c
        overall_after[new_c] += 1
    json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(recs, open(os.path.join(TOP, tid + '.perm.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    dist = Counter(q['c'] for q in quiz)
    print(f'{tid:11} n={len(quiz):2} new c-dist={dict(sorted(dist.items()))}')

print('\nOVERALL before:', dict(sorted(overall_before.items())))
print('OVERALL after :', dict(sorted(overall_after.items())))
