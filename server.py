#!/usr/bin/env python
import whisper
import bottle

import collections
import time
import json
import os

DATA_PATH = '/var/lib/graphite'


def summarize(data, interval=3600):
    values = collections.defaultdict(int)
    count = collections.defaultdict(int)
    for ts, value in data:
        t = ts - (ts % interval)
        count[t] += 1
        values[t] += value
    for t in values:
        avg = float(values[t]) / float(count[t])
        yield (t, avg)


def apply_timerange(timerange, values):
    for i, ts in enumerate(xrange(*timerange)):
        if values[i] is None:
            continue
        v = int(values[i])
        yield (ts, v)
    return
        

@bottle.get('/metrics/:target')
def get_metrics(target):
    timerange = int(bottle.request.params.get('timerange', 3600))
    resolution = int(bottle.request.params.get('resolution', 60))
    metrics = []

    now = time.time()
    path = '%s/whisper/%s.wsp' % (DATA_PATH, target.replace('.', '/'))
    if not os.path.exists(path):
        bottle.response.status = 404
        return {'key': target, 'values': []}
    timerange, values = whisper.fetch(path, now-timerange)

    start = time.time()
    r = apply_timerange(timerange, values)
    r = summarize(r, resolution)
    r = sorted(r)
    r = list(r)

    bottle.response.content_type = 'application/json'
    response = json.dumps({'key': target, 'values': r}, separators=(',',':'))
    return response


if __name__ == '__main__':
    bottle.debug(True)
    bottle.run(host='0.0.0.0', port=8888)