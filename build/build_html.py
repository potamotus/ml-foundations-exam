#!/usr/bin/env python3
# Assemble the single-file ML exam trainer from verified topic JSONs.
import json, os, re, sys

BASE = '/Users/matveytkhai/Documents/uni/ОМО/ml-trainer-build'
TOPDIR = os.path.join(BASE, 'topics')
TEMPLATE = os.path.join(BASE, 'template.html')
MATHJAX = os.path.join(BASE, 'mathjax-tex-svg.js')
OUT = '/Users/matveytkhai/Documents/uni/ОМО/Тренажёр ОМО — Машинное обучение.html'

# taxonomy: order follows the 2026 lecture sequence; 4th field = lecture badge.
# (lecture mapping verified against lecture titles + term frequencies in the PDFs)
TAXO = [
    ('intro',     'Введение в ML',            'Задачи, обозначения, обучение',      'Л1'),
    ('knn',       'kNN',                      'Метрики, accuracy, переобучение, CV','Л2–3'),
    ('linreg',    'Линейная регрессия',       'MSE, матрицы, аналит. решение',      'Л4–6'),
    ('gd',        'Градиентный спуск',        'GD/SGD, шаг, останов',               'Л5–6'),
    ('regul',     'Регуляризация',            'Ridge, LASSO, λ, отбор',             'Л5'),
    ('losses',    'Отступ и потери',          'margin, суррогатные потери',         'Л7'),
    ('metrics',   'Метрики классификации',    'Precision/Recall, F, ROC/AUC',       'Л8'),
    ('logreg',    'Логистическая регрессия',  'Сигмоида, log-loss, вероятности',    'Л9'),
    ('svm',       'SVM',                      'Зазор, hinge, hard/soft, OvA/AvA',   'Л9–10'),
    ('trees',     'Решающие деревья',         'Энтропия/Джини, критерий',           'Л11'),
    ('bagging',   'Бэггинг и лес',            'Bias-variance, бутстрап, OOB',       'Л12–13'),
    ('boosting',  'Бустинг',                  'Сдвиги, GD в простр. функций',       'Л13–14'),
    ('clustering','Кластеризация',            'K-means, DBSCAN, mean shift',        'Л14–15'),
    ('dimred',    'Снижение размерности',     'Отбор признаков, PCA, тексты',       'Л16–17'),
    ('ranking',   'Ранжирование',             'Постановка, метрики',                'Л17'),
]

REQ = ['intro', 'theory', 'quiz', 'open', 'cheat']

def latex_balance_warns(topic_id, obj):
    """Collect strings, check \\( \\) pairing and $$ evenness and brace balance."""
    warns = []
    def _walk(o):
        if isinstance(o, str): return o + '\n'
        if isinstance(o, list): return ''.join(_walk(x) for x in o)
        if isinstance(o, dict): return ''.join(_walk(v) for v in o.values())
        return ''
    blob = _walk(obj)  # decoded strings (not json-escaped), so cases row-sep \\ isn't miscounted
    op = len(re.findall(r'(?<!\\)\\\(', blob)); cl = len(re.findall(r'(?<!\\)\\\)', blob))
    if op != cl:
        warns.append(f'{topic_id}: \\( = {op} но \\) = {cl} (несбалансированы inline-формулы)')
    dd = blob.count('$$')
    if dd % 2 != 0:
        warns.append(f'{topic_id}: нечётное число $$ ({dd}) — несбалансированы display-формулы')
    return warns

def main():
    topics_meta = []
    data = {}
    problems = []
    summary = []
    for tid, t, d, lec in TAXO:
        path = os.path.join(TOPDIR, tid + '.json')
        if not os.path.exists(path):
            problems.append(f'ОТСУТСТВУЕТ файл темы: {tid}.json')
            continue
        try:
            with open(path, encoding='utf-8') as fh:
                obj = json.load(fh)
        except Exception as e:
            problems.append(f'{tid}.json НЕ ПАРСИТСЯ как JSON: {e}')
            continue
        miss = [k for k in REQ if k not in obj]
        if miss:
            problems.append(f'{tid}: нет ключей {miss}')
        # normalize / guard
        for k in ['theory', 'quiz', 'open', 'cheat']:
            obj.setdefault(k, [])
        # quiz key sanity
        for i, q in enumerate(obj.get('quiz', [])):
            if not isinstance(q.get('o'), list) or not (0 <= q.get('c', -1) < len(q.get('o', []))):
                problems.append(f'{tid} quiz[{i}]: некорректный c/o')
        problems.extend(latex_balance_warns(tid, obj))
        obj['id'] = tid
        data[tid] = obj
        topics_meta.append({'id': tid, 't': t, 'd': d, 'l': lec})
        summary.append(f"  {tid:11} theory={len(obj['theory']):2} quiz={len(obj['quiz']):2} "
                       f"open={len(obj['open']):2} cheat={len(obj['cheat']):2}")

    if not topics_meta:
        print('FATAL: ни одной темы не собрано'); sys.exit(1)

    with open(TEMPLATE, encoding='utf-8') as fh:
        html = fh.read()
    with open(MATHJAX, encoding='utf-8') as fh:
        mj = fh.read()
    with open(os.path.join(BASE, 'figures.js'), encoding='utf-8') as fh:
        figs = fh.read()

    topics_js = json.dumps(topics_meta, ensure_ascii=False)
    data_js = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')  # avoid premature </script>

    html = html.replace('/*__MATHJAX__*/', mj)
    html = html.replace('/*__FIGS__*/', figs)
    html = html.replace('/*__TOPICS__*/', topics_js)
    html = html.replace('/*__DATA__*/', data_js)

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(html)

    print('=== СБОРКА ===')
    print(f'Тем собрано: {len(topics_meta)}/{len(TAXO)}')
    print('\n'.join(summary))
    print(f'\nРазмер файла: {os.path.getsize(OUT)//1024} KB')
    print(f'Файл: {OUT}')
    if problems:
        print('\n=== ПРОБЛЕМЫ (' + str(len(problems)) + ') ===')
        for p in problems:
            print('  !', p)
    else:
        print('\nПроблем не обнаружено.')

if __name__ == '__main__':
    main()
