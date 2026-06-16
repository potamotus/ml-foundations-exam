#!/usr/bin/env python3
# Prune confirmed beyond-lecture items and remap theory refs.
# Reads cuts.json = {topic: {theory:[i...], quiz:[...], open:[...], cheat:[...]}}.
# For each topic: delete listed indices; rebuild oldTheoryIdx->newIdx map;
# remap surviving quiz/open refs (ref into a removed theory card -> None).
import json, os, sys
TOP = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/topics'
CUTS = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build/cuts.json'

def main():
    cuts = json.load(open(CUTS, encoding='utf-8'))
    grand = {'theory':0,'quiz':0,'open':0,'cheat':0}
    problems = []
    for tid, c in cuts.items():
        jf = os.path.join(TOP, tid + '.json')
        d = json.load(open(jf, encoding='utf-8'))
        cutT = set(c.get('theory', []))
        # build old->new theory index map for survivors
        newmap = {}
        new_theory = []
        for old, card in enumerate(d['theory']):
            if old in cutT:
                continue
            newmap[old] = len(new_theory)
            new_theory.append(card)
        # prune lists by index
        def prune(arr, idxs):
            s = set(idxs)
            return [x for i, x in enumerate(arr) if i not in s]
        new_quiz = prune(d['quiz'], c.get('quiz', []))
        new_open = prune(d['open'], c.get('open', []))
        new_cheat = prune(d['cheat'], c.get('cheat', []))
        # remap refs in surviving quiz/open
        def remap(items):
            for it in items:
                r = it.get('ref')
                if r is None:
                    continue
                if r in newmap:
                    it['ref'] = newmap[r]
                else:  # ref pointed to a removed theory card
                    it.pop('ref', None)
        remap(new_quiz); remap(new_open)
        grand['theory'] += len(cutT)
        grand['quiz'] += len(d['quiz']) - len(new_quiz)
        grand['open'] += len(d['open']) - len(new_open)
        grand['cheat'] += len(d['cheat']) - len(new_cheat)
        d['theory'], d['quiz'], d['open'], d['cheat'] = new_theory, new_quiz, new_open, new_cheat
        # validate
        nt = len(new_theory)
        for i, q in enumerate(new_quiz):
            r = q.get('ref')
            if r is not None and not (0 <= r < nt):
                problems.append(f'{tid} quiz[{i}] ref {r} вне [0,{nt})')
            if not isinstance(q.get('o'), list) or not (0 <= q.get('c', -1) < len(q.get('o', []))):
                problems.append(f'{tid} quiz[{i}] плохой c/o')
        json.dump(d, open(jf, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{tid:11} -theory={len(cutT):2} -quiz={len(d["quiz"]) and len(c.get("quiz",[])):2} '
              f'-> theory={len(new_theory):2} quiz={len(new_quiz):2} open={len(new_open):2} cheat={len(new_cheat):2}')
    print('\nУдалено всего:', grand)
    print('ПРОБЛЕМЫ:' if problems else 'проблем нет')
    for p in problems:
        print('  !', p)
    if problems:
        sys.exit(1)

if __name__ == '__main__':
    main()
