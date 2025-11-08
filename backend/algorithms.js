// function linearSearch(songs, key, value) {
//     for (const song of songs) {
//         if (song[key] === value) return song;
//     }
//     return null;
// }

// function fractionalKnapsack(songs, maxDuration, valueProperty = 'popularity') {
//     songs.sort((a, b) =>
//         (b[valueProperty] / b.duration) - (a[valueProperty] / a.duration)
//     );

//     let total = 0, res = [];
//     for (const song of songs) {
//         if (total + song.duration <= maxDuration) {
//             res.push({ ...song, fraction: 1 });
//             total += song.duration;
//         } else {
//             const remaining = Math.max(0, maxDuration - total);
//             if (remaining > 0) {
//                 const fraction = remaining / song.duration;
//                 res.push({ ...song, fraction });
//             }
//             break;
//         }
//     }
//     return res;
// }

// const freqStore = new Map();

// function recordFrequency(songId) {
//     freqStore.set(songId, (freqStore.get(songId) || 0) + 1);
// }

// module.exports = { linearSearch, fractionalKnapsack, freqStore, recordFrequency };



function linearSearch(songs, key, value) {
    for (const song of songs) {
        if (song[key] === value) return song;
    }
    return null;
}

function fractionalKnapsack(songs, maxDuration, valueProperty = 'popularity') {
    songs.sort((a, b) =>
        (b[valueProperty] / b.duration) - (a[valueProperty] / a.duration)
    );

    let total = 0, res = [];
    for (const song of songs) {
        if (total + song.duration <= maxDuration) {
            res.push({ ...song, fraction: 1 });
            total += song.duration;
        } else {
            const remaining = Math.max(0, maxDuration - total);
            if (remaining > 0) {
                const fraction = remaining / song.duration;
                res.push({ ...song, fraction });
            }
            break;
        }
    }
    return res;
}

const freqStore = new Map();

function recordFrequency(songId) {
    freqStore.set(songId, (freqStore.get(songId) || 0) + 1);
}


class Node {
    constructor(key, freq) {
        this.key = key;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

// /**
//  * Build Optimal Binary Search Tree using Dynamic Programming
//  * @param {Array<string>} keys - sorted list of song IDs or names
//  * @param {Array<number>} freq - corresponding access frequencies
//  * @returns {Node} root node of the OBST
//  */
function buildOBST(keys, freq) {
    const n = keys.length;
    const cost = Array.from({ length: n }, () => Array(n).fill(0));
    const root = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        cost[i][i] = freq[i];
        root[i][i] = i;
    }

    for (let L = 2; L <= n; L++) {
        for (let i = 0; i <= n - L + 1; i++) {
            const j = i + L - 1;
            cost[i][j] = Infinity;
            let sum = 0;
            for (let s = i; s <= j; s++) sum += freq[s];

            for (let r = i; r <= j; r++) {
                const c = ((r > i) ? cost[i][r - 1] : 0) +
                          ((r < j) ? cost[r + 1][j] : 0) + sum;

                if (c < cost[i][j]) {
                    cost[i][j] = c;
                    root[i][j] = r;
                }
            }
        }
    }

    function buildTree(i, j) {
        if (i > j) return null;
        const r = root[i][j];
        const node = new Node(keys[r], freq[r]);
        node.left = buildTree(i, r - 1);
        node.right = buildTree(r + 1, j);
        return node;
    }

    return buildTree(0, n - 1);
}

// /**
//  * Search a key in OBST
//  * @param {Node} root - root of the OBST
//  * @param {string} key - key to search
//  * @returns {Node|null} - found node or null
//  */
function searchOBST(root, key) {
    if (!root) return null;
    if (key === root.key) return root;
    if (key < root.key) return searchOBST(root.left, key);
    else return searchOBST(root.right, key);
}


function buildOBSTFromFreqStore() {
    const keys = [...freqStore.keys()].sort();
    const freq = keys.map(k => freqStore.get(k));
    return buildOBST(keys, freq);
}

module.exports = {
    linearSearch,
    fractionalKnapsack,
    freqStore,
    recordFrequency,
    buildOBST,
    searchOBST,
    buildOBSTFromFreqStore
};
