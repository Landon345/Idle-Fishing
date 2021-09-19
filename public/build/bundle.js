
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update$1(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const daysToYears = (days) => Math.floor(days / 365);
    const days = (day) => Math.floor(day % 365);
    function calculatedAge(day) {
        return `Age ${14 + daysToYears(day)} Day ${days(day)}`;
    }
    const getTotalExpenses = (game_data) => {
        let totalExpense = 0;
        game_data.itemData.forEach((item) => {
            if (item.selected) {
                totalExpense += item.expense;
            }
        });
        return totalExpense;
    };
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function applySpeed(value) {
        // Make sure to divide by updateSpeed
        return (value * getGameSpeed()) / updateSpeed;
    }
    function getGameSpeed() {
        return baseGameSpeed * +!getGameData().paused * +isAlive();
    }
    function isAlive() {
        return getGameData().day < baseLifespan;
    }
    const needRequirements = (data_value, requiredFor // Class Fish or Skill
    ) => {
        let reqs = data_value.requirements.get(requiredFor.name);
        // Reqs is an array of requirements
        if (reqs == undefined) {
            return false;
        }
        for (let i = 0; i < reqs.length; i++) {
            if (!reqs[i].isCompleted()) {
                return true;
            }
        }
        return false;
    };
    const filtered = (data_value, allRequiredFor) => {
        // returns all Fish that have completed requirements + 1 that doesn't.
        const filteredTasks = [];
        for (let i = 0; i < allRequiredFor.length; i++) {
            if (!needRequirements(data_value, allRequiredFor[i])) {
                filteredTasks.push(allRequiredFor[i]);
            }
            else {
                filteredTasks.push(allRequiredFor[i]);
                break;
            }
        }
        return filteredTasks;
    };
    const getRequiredString = (data_value, requiredFor) => {
        let reqs = data_value.requirements.get(requiredFor.name);
        let requiredString = `Required: `;
        for (let i = 0; i < reqs.length; i++) {
            let sameTypeReqs = reqs[i].requirements;
            let type = reqs[i].type;
            for (let j = 0; j < sameTypeReqs.length; j++) {
                if (["fishing", "skill"].includes(type)) {
                    let name = sameTypeReqs[j].name;
                    let levelNow = type == "skill"
                        ? data_value.skillsData.get(name).level
                        : data_value.fishingData.get(name).level;
                    requiredString += `${name} level ${levelNow}/${sameTypeReqs[j].requirement}, `;
                }
                else if (type == "age") {
                    requiredString += `${daysToYears(data_value.day)} years old, `;
                }
                else if (type == "boat") {
                    requiredString += `${sameTypeReqs[j].name}, `;
                }
                else if (type == "coin") {
                    requiredString += `${sameTypeReqs[j].requirement} coins, `;
                }
            }
        }
        let endIndex = requiredString.length - 1;
        requiredString = requiredString.slice(0, endIndex - 1);
        return requiredString;
    };
    function formatNumber(number) {
        // what tier? (determines SI symbol)
        if (number < 1000) {
            return number.toFixed(1);
        }
        let tier = (Math.log10(number) / 3) | 0;
        // if zero, we don't need a suffix
        if (tier == 0)
            return number;
        // get suffix and determine scale
        let suffix = units[tier];
        let scale = Math.pow(10, tier * 3);
        // scale the number
        let scaled = number / scale;
        // format number and add suffix
        return scaled.toFixed(2) + suffix;
    }
    function lowestLevelSkill(data_value) {
        let xpDict = new Map();
        const skills = data_value.skillsData;
        skills.forEach((s) => {
            if (!needRequirements(data_value, s)) {
                xpDict.set(s.name, s.level);
            }
        });
        if (xpDict.size == 0) {
            return skills.get("Strength");
        }
        let lowest = new Map([...xpDict.entries()].sort((a, b) => a[1] - b[1]));
        return skills.get(lowest.entries().next().value[0]);
    }
    function highestTierFish(data_value) {
        const fish = data_value.fishingData;
        let availableFish = new Map();
        fish.forEach((f) => {
            if (!needRequirements(data_value, f)) {
                availableFish.set(f.name, f);
            }
        });
        if (availableFish.size == 0) {
            return fish.get("Sun Fish");
        }
        let highest = Array.from(availableFish.values()).pop();
        return highest;
    }
    function applyMultipliers(value, multipliers) {
        let totalAfter = Object.values(multipliers).reduce((num, total) => (total *= num), value);
        return totalAfter;
    }
    const getIncomeMultipliers = (task) => {
        let multipliers = {};
        getGameData().fishingData.forEach((fish) => {
            let effect = kind(task, fish.baseData.description, fish.effect);
            if (effect != 1) {
                multipliers[fish.name] = effect;
            }
        });
        getGameData().skillsData.forEach((skill) => {
            let effect = kind(task, skill.baseData.description, skill.effect);
            if (effect != 1) {
                multipliers[skill.name] = effect;
            }
        });
        getGameData().itemData.forEach((item) => {
            let effect = kind(task, item.baseData.description, item.effect);
            if (effect != 1) {
                multipliers[item.name] = effect;
            }
        });
        function kind(task, description, effect) {
            switch (description) {
                case "Fishing Pay":
                    return effect;
                case "Lake Pay":
                    if (task.baseData.category == "lake")
                        return effect;
                    break;
                case "River Pay":
                    if (task.baseData.category == "river")
                        return effect;
                    break;
                case "Ocean Pay":
                    if (task.baseData.category == "ocean")
                        return effect;
                    break;
                case "Payara Pay":
                    if (task.name == "Payara")
                        return effect;
                    break;
                case "Northern Pay":
                    if (task.name == "Northern")
                        return effect;
                    break;
                case "Whale Pay":
                    if (task.name == "Whale")
                        return effect;
                    break;
                default:
                    return 1;
            }
            return 1;
        }
        return multipliers;
    };
    const getXpMultipliers = (task) => {
        let multipliers = {};
        getGameData().fishingData.forEach((fish) => {
            let effect = kind(task, fish.baseData.description, fish.effect);
            if (effect != 1) {
                multipliers[fish.name] = effect;
            }
        });
        getGameData().skillsData.forEach((skill) => {
            let effect = kind(task, skill.baseData.description, skill.effect);
            if (effect != 1) {
                multipliers[skill.name] = effect;
            }
        });
        getGameData().itemData.forEach((item) => {
            let effect = kind(task, item.baseData.description, item.effect);
            if (effect != 1) {
                multipliers[item.name] = effect;
            }
        });
        function kind(task, description, effect) {
            switch (description) {
                case "All Xp":
                    return effect;
                case "Fishing Skill Xp":
                    if (task instanceof Skill && task.baseData.category == "fishing")
                        return effect;
                    break;
                case "Boating Skill Xp":
                    if (task instanceof Skill && task.baseData.category == "boating")
                        return effect;
                    break;
                case "Fishing Xp":
                    if (task instanceof Fishing)
                        return effect;
                    break;
                case "Skill Xp":
                    if (task instanceof Skill)
                        return effect;
                    break;
                case "Lake Xp":
                    if (task.baseData.category == "lake")
                        return effect;
                    break;
                case "River Xp":
                    if (task.baseData.category == "river")
                        return effect;
                    break;
                case "Ocean Xp":
                    if (task.baseData.category == "ocean")
                        return effect;
                    break;
                case "Jigging Xp":
                    if (task.name == "Jigging")
                        return effect;
                    break;
                case "Casting Xp":
                    if (task.name == "Casting")
                        return effect;
                    break;
                case "Hooking Xp":
                    if (task.name == "Hooking")
                        return effect;
                    break;
                case "Trolling Xp":
                    if (task.name == "Trolling")
                        return effect;
                    break;
                case "Reeling Xp":
                    if (task.name == "Reeling")
                        return effect;
                    break;
                case "Strength Xp":
                    if (task.name == "Strength")
                        return effect;
                    break;
                case "Concentration Xp":
                    if (task.name == "Concentration")
                        return effect;
                    break;
                case "Intelligence Xp":
                    if (task.name == "Intelligence")
                        return effect;
                    break;
                case "Patience Xp":
                    if (task.name == "Patience")
                        return effect;
                    break;
                case "Communication Xp":
                    if (task.name == "Communication")
                        return effect;
                    break;
                case "Ambition Xp":
                    if (task.name == "Ambition")
                        return effect;
                    break;
                case "Sailing Xp":
                    if (task.name == "Sailing")
                        return effect;
                    break;
                case "Navigation Xp":
                    if (task.name == "Navigation")
                        return effect;
                    break;
                default:
                    return 1;
            }
            return 1;
        }
        return multipliers;
    };
    function coinAmounts(coins) {
        let coinsObj = {};
        if (coins < 0) {
            return { p: 0, g: 0, s: 0, c: 0 };
        }
        let tiers = ["p", "g", "s"];
        let leftOver = coins;
        let i = 0;
        for (let tier of tiers) {
            let x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2));
            leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2));
            coinsObj[tier] = x;
            i += 1;
        }
        coinsObj["c"] = leftOver;
        return coinsObj;
    }
    function replaceSaveDict(dict, saveDict) {
        let requirements;
        GameData.subscribe((data) => {
            requirements = data.requirements;
        });
        for (let key in dict) {
            if (!(key in saveDict)) {
                saveDict[key] = dict[key];
            }
            else if (dict == requirements) {
                if (saveDict[key].type != tempData["requirements"][key].type) {
                    saveDict[key] = tempData["requirements"][key];
                }
            }
        }
        for (let key in saveDict) {
            if (!(key in dict)) {
                delete saveDict[key];
            }
        }
    }
    function replaceSavedItems(map, saveMap) {
        map.forEach((val, key) => {
            let { baseData, expenseMultipliers, level } = saveMap.get(key);
            saveMap.set(key, new Item(baseData, expenseMultipliers, level));
        });
        return saveMap;
    }
    function replaceSavedBoats(map, saveMap) {
        map.forEach((val, key) => {
            let { baseData } = saveMap.get(key);
            saveMap.set(key, new Boat(baseData));
        });
        return saveMap;
    }
    function replaceSavedFishing(map, saveMap) {
        map.forEach((val, key) => {
            let { baseData, level, maxLevel, xp, xpMultipliers, incomeMultipliers } = saveMap.get(key);
            saveMap.set(key, new Fishing(baseData, level, maxLevel, xp, xpMultipliers, incomeMultipliers));
        });
        return saveMap;
    }
    function replaceSavedSkills(map, saveMap) {
        map.forEach((val, key) => {
            let { baseData, level, maxLevel, xp, xpMultipliers } = saveMap.get(key);
            saveMap.set(key, new Skill(baseData, level, maxLevel, xp, xpMultipliers));
        });
        return saveMap;
    }
    function replaceSavedRequirements(map, saveMap) {
        map.forEach((val, key) => {
            let reqArr = saveMap.get(key);
            let newReqArr = reqArr.map((req) => {
                let requirements = req.requirements;
                if (req.type == "fishing") {
                    return new FishingRequirement(requirements);
                }
                else if (req.type == "skill") {
                    return new SkillRequirement(requirements);
                }
                else if (req.type == "coins") {
                    return new CoinRequirement(requirements);
                }
                else if (req.type == "evil") {
                    return new EvilRequirement(requirements);
                }
                else if (req.type == "boat") {
                    return new BoatRequirement(requirements);
                }
                else if (req.type == "age") {
                    return new AgeRequirement(requirements);
                }
                else {
                    return new Requirement(requirements, "Unknown");
                }
            });
            saveMap.set(key, newReqArr);
        });
        return saveMap;
    }
    function createData(data, baseData) {
        baseData.forEach((base, key) => {
            createEntity(data, base);
        });
    }
    function createEntity(data, entity) {
        if ("income" in entity) {
            data.set(entity.name, new Fishing(entity));
        }
        else if ("maxXp" in entity) {
            data.set(entity.name, new Skill(entity));
        }
        else if ("bought" in entity) {
            data.set(entity.name, new Boat(entity));
        }
        else {
            data.set(entity.name, new Item(entity));
        }
    }
    function replacer(key, value) {
        if (value instanceof Map) {
            return {
                dataType: "Map",
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        }
        else {
            return value;
        }
    }
    function reviver(key, value) {
        if (typeof value === "object" && value !== null) {
            if (value.dataType === "Map") {
                return new Map(value.value);
            }
        }
        return value;
    }
    function saveGameData(data_value) {
        if (!data_value.paused) {
            localStorage.setItem("GameDataSave", JSON.stringify(data_value, replacer));
        }
    }
    function loadGameData() {
        let GameDataSave = JSON.parse(localStorage.getItem("GameDataSave"), reviver);
        if (GameDataSave !== null) {
            let data_value;
            let requirements;
            let fishingData;
            let skillsData;
            let itemData;
            let boatData;
            GameData.subscribe((data) => {
                data_value = data;
                requirements = data.requirements;
                fishingData = data.fishingData;
                skillsData = data.skillsData;
                itemData = data.itemData;
                boatData = data.boatData;
            });
            replaceSaveDict(data_value, GameDataSave);
            replaceSavedRequirements(requirements, GameDataSave.requirements);
            replaceSavedFishing(fishingData, GameDataSave.fishingData);
            replaceSavedSkills(skillsData, GameDataSave.skillsData);
            replaceSavedItems(itemData, GameDataSave.itemData);
            replaceSavedBoats(boatData, GameDataSave.boatData);
            setGameData(GameDataSave);
        }
    }

    class Task {
        constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = {}) {
            this.baseData = baseData;
            this.name = baseData.name;
            this.level = level;
            this.maxLevel = maxLevel;
            this.xp = xp;
            this.xpMultipliers = xpMultipliers;
        }
        get maxXp() {
            let maxXp = Math.round(this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level));
            return maxXp;
        }
        get xpLeft() {
            return Math.round(this.maxXp - this.xp);
        }
        get maxLevelMultiplier() {
            let maxLevelMultiplier = 1 + this.maxLevel / 10;
            return maxLevelMultiplier;
        }
        get xpGain() {
            this.xpMultipliers = getXpMultipliers(this);
            return applyMultipliers(10, this.xpMultipliers) * this.maxLevelMultiplier;
        }
        get barWidth() {
            return ((this.maxXp - this.xpLeft) / this.maxXp) * 100;
        }
        increaseXp() {
            this.xp += applySpeed(this.xpGain);
            if (this.xp >= this.maxXp) {
                let excess = this.xp - this.maxXp;
                while (excess >= 0) {
                    this.level += 1;
                    excess -= this.maxXp;
                }
                this.xp = this.maxXp + excess;
            }
        }
    }
    class Fishing extends Task {
        constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = {}, incomeMultipliers = {}) {
            super(baseData, level, maxLevel, xp, xpMultipliers);
            this.incomeMultipliers = incomeMultipliers;
        }
        get levelMultiplier() {
            let levelMultiplier = 1 + Math.log10(this.level + 1);
            return levelMultiplier;
        }
        get income() {
            this.incomeMultipliers = getIncomeMultipliers(this);
            return (applyMultipliers(this.baseData.income, this.incomeMultipliers) *
                this.levelMultiplier);
        }
        get effect() {
            let effect = 1 + this.baseData.effect * this.level;
            return effect;
        }
        get effectDescription() {
            let description = this.baseData.description;
            let text = "x" + String(this.effect.toFixed(2)) + " " + description;
            return text;
        }
    }
    class Skill extends Task {
        constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = {}) {
            super(baseData, level, maxLevel, xp, xpMultipliers);
        }
        get effect() {
            let effect = 1 + this.baseData.effect * this.level;
            return effect;
        }
        get effectDescription() {
            let description = this.baseData.description;
            let text = "x" + String(this.effect.toFixed(2)) + " " + description;
            return text;
        }
    }
    class Item {
        constructor(baseData, expenseMultipliers = {}, level = 0) {
            this.baseData = baseData;
            this.name = baseData.name;
            this.expenseMultipliers = expenseMultipliers;
            this.level = level;
        }
        get selected() {
            return this.baseData.selected;
        }
        select() {
            this.baseData.selected = !this.baseData.selected;
        }
        deselect() {
            this.baseData.selected = false;
        }
        get upgradePrice() {
            return this.baseData.upgradePrice * Math.pow(2, 0.5 * this.level);
        }
        get effect() {
            if (!this.selected)
                return 1;
            let effect = this.baseData.effect * (1 + this.level / 100);
            return effect;
        }
        get effectDescription() {
            let description = this.baseData.description;
            let text = "x" + String(this.effect.toFixed(2)) + " " + description;
            return text;
        }
        get expense() {
            return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
        }
        upgrade() {
            if (this.baseData.upgradePrice <= getGameData().coins) {
                subtractCoins(this.upgradePrice);
                this.level += 1;
            }
        }
    }
    class Boat {
        constructor(baseData) {
            this.baseData = baseData;
            this.name = baseData.name;
        }
        get bought() {
            return this.baseData.bought;
        }
        buy() {
            if (this.bought) {
                return;
            }
            if (this.baseData.price <= getGameData().coins) {
                subtractCoins(this.baseData.price);
                this.baseData.bought = true;
            }
        }
    }
    class Requirement {
        constructor(requirements, type) {
            this.requirements = requirements;
            this.completed = false;
            this.type = type;
        }
        getCondition(requirement) {
            return false;
        }
        isCompleted() {
            if (this.completed) {
                return true;
            }
            for (let requirement of this.requirements) {
                if (!this.getCondition(requirement)) {
                    return false;
                }
            }
            this.completed = true;
            return true;
        }
    }
    class FishingRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "fishing");
        }
        getCondition(requirement) {
            return (getGameData().fishingData.get(requirement.name).level >=
                requirement.requirement);
        }
    }
    class SkillRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "skill");
        }
        getCondition(requirement) {
            return (getGameData().skillsData.get(requirement.name).level >=
                requirement.requirement);
        }
    }
    class CoinRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "coins");
        }
        getCondition(requirement) {
            return getGameData().coins >= requirement.requirement;
        }
    }
    class AgeRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "age");
        }
        getCondition(requirement) {
            return daysToYears(getGameData().day) >= requirement.requirement;
        }
    }
    class BoatRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "boat");
        }
        getCondition(requirement) {
            return (getGameData().boatData.get(requirement.name).bought ==
                requirement.requirement);
        }
    }
    class EvilRequirement extends Requirement {
        constructor(requirements) {
            super(requirements, "evil");
        }
        getCondition(requirement) {
            return getGameData().evil >= requirement.requirement;
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const requirements = new Map([
        ["Sun Fish", []],
        ["Perch", [new FishingRequirement([{ name: "Sun Fish", requirement: 10 }])]],
        [
            "Bass",
            [
                new FishingRequirement([{ name: "Perch", requirement: 10 }]),
                new BoatRequirement([{ name: "Row Boat", requirement: true }]),
            ],
        ],
        [
            "Trout",
            [
                new FishingRequirement([{ name: "Bass", requirement: 10 }]),
                new SkillRequirement([{ name: "Strength", requirement: 10 }]),
            ],
        ],
        [
            "Waleye",
            [
                new FishingRequirement([{ name: "Trout", requirement: 10 }]),
                new SkillRequirement([{ name: "Strength", requirement: 30 }]),
                new BoatRequirement([{ name: "Silver Bullet", requirement: true }]),
            ],
        ],
        [
            "Northern Pike",
            [
                new FishingRequirement([{ name: "Waleye", requirement: 10 }]),
                new SkillRequirement([{ name: "Ambition", requirement: 50 }]),
            ],
        ],
        [
            "Lake Sturgeon",
            [
                new FishingRequirement([{ name: "Northern Pike", requirement: 10 }]),
                new SkillRequirement([{ name: "Patience", requirement: 80 }]),
                new BoatRequirement([{ name: "Bass Boat", requirement: true }]),
            ],
        ],
        // River
        // 1. Pirana
        // 2. Salmon
        // 2. Silver Drum
        // 3. Armoured Catfish
        // 4. Electric Eel
        // 5. Pacu
        // 6. Payara
        ["Pirana", [new SkillRequirement([{ name: "Strength", requirement: 10 }])]],
        [
            "Salmon",
            [
                new FishingRequirement([{ name: "Pirana", requirement: 10 }]),
                new SkillRequirement([{ name: "Strength", requirement: 30 }]),
            ],
        ],
        [
            "Silver Drum",
            [
                new FishingRequirement([{ name: "Salmon", requirement: 10 }]),
                new SkillRequirement([{ name: "Intelligence", requirement: 40 }]),
                new BoatRequirement([{ name: "Canoe", requirement: true }]),
            ],
        ],
        [
            "Armoured Catfish",
            [
                new FishingRequirement([{ name: "Silver Drum", requirement: 10 }]),
                new SkillRequirement([{ name: "Casting", requirement: 100 }]),
            ],
        ],
        [
            "Electric Eel",
            [
                new FishingRequirement([{ name: "Armoured Catfish", requirement: 10 }]),
                new SkillRequirement([{ name: "Strength", requirement: 300 }]),
                new BoatRequirement([{ name: "River Skiff", requirement: true }]),
            ],
        ],
        [
            "Pacu",
            [
                new FishingRequirement([{ name: "Electric Eel", requirement: 10 }]),
                new SkillRequirement([{ name: "Trolling", requirement: 500 }]),
            ],
        ],
        [
            "Payara",
            [
                new FishingRequirement([{ name: "Pacu", requirement: 10 }]),
                new SkillRequirement([{ name: "Reeling", requirement: 1000 }]),
                new BoatRequirement([{ name: "Airboat", requirement: true }]),
            ],
        ],
        // Ocean
        // 1. Cod
        // 2. Mackerel
        // 2. Angle Fish
        // 4. Grouper
        // Stingray
        // 6. Barracuda
        // 3. Bluefin tuna
        // 5. Blue Marlin
        // Swordfish
        // Shark
        // Whale
        [
            "Cod",
            [
                new SkillRequirement([
                    { name: "Patience", requirement: 200 },
                    { name: "Concentration", requirement: 200 },
                ]),
                new BoatRequirement([{ name: "Sail Boat", requirement: true }]),
            ],
        ],
        [
            "Mackerel",
            [
                new FishingRequirement([{ name: "Cod", requirement: 10 }]),
                new SkillRequirement([
                    { name: "Docking", requirement: 400 },
                    { name: "Netting", requirement: 200 },
                ]),
            ],
        ],
        [
            "Angle Fish",
            [
                new FishingRequirement([{ name: "Mackerel", requirement: 10 }]),
                new SkillRequirement([
                    { name: "Docking", requirement: 700 },
                    { name: "Turning", requirement: 600 },
                ]),
            ],
        ],
        [
            "Grouper",
            [
                new FishingRequirement([{ name: "Angle Fish", requirement: 10 }]),
                new SkillRequirement([{ name: "Anchoring", requirement: 1000 }]),
            ],
        ],
        [
            "Stingray",
            [
                new FishingRequirement([{ name: "Grouper", requirement: 10 }]),
                new SkillRequirement([{ name: "Docking", requirement: 1200 }]),
            ],
        ],
        [
            "Barracuda",
            [
                new FishingRequirement([{ name: "Stingray", requirement: 10 }]),
                new SkillRequirement([{ name: "Turning", requirement: 1400 }]),
            ],
        ],
        [
            "Bluefin Tuna",
            [
                new FishingRequirement([{ name: "Barracuda", requirement: 10 }]),
                new SkillRequirement([{ name: "Sailing", requirement: 1500 }]),
                new BoatRequirement([{ name: "Yacht", requirement: true }]),
            ],
        ],
        [
            "Blue Marlin",
            [
                new FishingRequirement([{ name: "Bluefin Tuna", requirement: 10 }]),
                new SkillRequirement([{ name: "Sailing", requirement: 1800 }]),
            ],
        ],
        [
            "Swordfish",
            [
                new FishingRequirement([{ name: "Blue Marlin", requirement: 10 }]),
                new SkillRequirement([{ name: "Navigation", requirement: 1900 }]),
            ],
        ],
        [
            "Shark",
            [
                new FishingRequirement([{ name: "Swordfish", requirement: 10 }]),
                new SkillRequirement([{ name: "Stability", requirement: 2000 }]),
            ],
        ],
        [
            "Whale",
            [
                new FishingRequirement([{ name: "Shark", requirement: 10 }]),
                new SkillRequirement([{ name: "Stability", requirement: 2500 }]),
                new BoatRequirement([{ name: "Whaling Ship", requirement: true }]),
            ],
        ],
        // FUNDAMENTALS //
        // Strength
        // Concentration
        // Intelligence
        // Patience
        // Ambition
        // Communication
        ["Strength", []],
        ["Concentration", []],
        [
            "Intelligence",
            [new SkillRequirement([{ name: "Concentration", requirement: 10 }])],
        ],
        [
            "Patience",
            [new SkillRequirement([{ name: "Concentration", requirement: 20 }])],
        ],
        [
            "Ambition",
            [new SkillRequirement([{ name: "Intelligence", requirement: 30 }])],
        ],
        [
            "Communication",
            [
                new SkillRequirement([
                    { name: "Intelligence", requirement: 30 },
                    { name: "Strength", requirement: 40 },
                ]),
            ],
        ],
        // FISHING SKILLS
        // Casting
        // Jigging
        // Trolling
        // Reeling
        // Hooking
        // Netting
        // Whaling
        ["Casting", []],
        ["Jigging", [new SkillRequirement([{ name: "Strength", requirement: 30 }])]],
        [
            "Trolling",
            [new SkillRequirement([{ name: "Concentration", requirement: 40 }])],
        ],
        ["Reeling", [new SkillRequirement([{ name: "Strength", requirement: 60 }])]],
        ["Hooking", [new SkillRequirement([{ name: "Jigging", requirement: 40 }])]],
        [
            "Netting",
            [new SkillRequirement([{ name: "Concentration", requirement: 120 }])],
        ],
        ["Whaling", [new SkillRequirement([{ name: "Strength", requirement: 250 }])]],
        // Boating Skills
        // Docking
        // Turning
        // Anchoring
        // Sailing
        // Navigation
        // Stability
        [
            "Docking",
            [
                new SkillRequirement([
                    { name: "Concentration", requirement: 200 },
                    { name: "Intelligence", requirement: 200 },
                ]),
            ],
        ],
        [
            "Turning",
            [
                new SkillRequirement([
                    { name: "Concentration", requirement: 320 },
                    { name: "Patience", requirement: 250 },
                ]),
            ],
        ],
        ["Anchoring", [new FishingRequirement([{ name: "Cod", requirement: 15 }])]],
        [
            "Sailing",
            [new FishingRequirement([{ name: "Angle Fish", requirement: 10 }])],
        ],
        [
            "Navigation",
            [new SkillRequirement([{ name: "Trolling", requirement: 400 }])],
        ],
        [
            "Stability",
            [new SkillRequirement([{ name: "Anchoring", requirement: 500 }])],
        ],
        ["Row Boat", [new CoinRequirement([{ name: "Coins", requirement: 500 }])]],
        [
            "Silver Bullet",
            [new CoinRequirement([{ name: "Coins", requirement: 1000 }])],
        ],
        ["Bass Boat", [new CoinRequirement([{ name: "Coins", requirement: 50000 }])]],
        ["Canoe", [new CoinRequirement([{ name: "Coins", requirement: 500000 }])]],
        [
            "River Skiff",
            [new CoinRequirement([{ name: "Coins", requirement: 1000000 }])],
        ],
        ["Airboat", [new CoinRequirement([{ name: "Coins", requirement: 5000000 }])]],
        [
            "Sail Boat",
            [new CoinRequirement([{ name: "Coins", requirement: 10000000 }])],
        ],
        ["Yacht", [new CoinRequirement([{ name: "Coins", requirement: 50000000 }])]],
        [
            "Whaling Ship",
            [new CoinRequirement([{ name: "Coins", requirement: 500000000 }])],
        ],
        // ITEMS //
        // Rod
        // Book
        // Net
        // Hook
        // Bait
        // Ham Sandwich
        // Pliers
        // Fish Finder
        // House
        ["Rod", [new CoinRequirement([{ name: "Coins", requirement: 500 }])]],
        ["Book", [new CoinRequirement([{ name: "Coins", requirement: 3000 }])]],
        ["Net", [new CoinRequirement([{ name: "Coins", requirement: 30000 }])]],
        ["Hook", [new CoinRequirement([{ name: "Coins", requirement: 50000 }])]],
        ["Bait", [new CoinRequirement([{ name: "Coins", requirement: 300000 }])]],
        [
            "Ham Sandwich",
            [new CoinRequirement([{ name: "Coins", requirement: 500000 }])],
        ],
        ["Pliers", [new CoinRequirement([{ name: "Coins", requirement: 1000000 }])]],
        [
            "Fish Finder",
            [new CoinRequirement([{ name: "Coins", requirement: 5000000 }])],
        ],
        ["House", [new CoinRequirement([{ name: "Coins", requirement: 10000000 }])]],
    ]);
    let GameData = writable({
        day: 0,
        coins: 0,
        fishingData: new Map(),
        skillsData: new Map(),
        itemData: new Map(),
        boatData: new Map(),
        requirements,
        paused: false,
        autoTrain: false,
        autoFish: false,
        rebirthOneCount: 0,
        rebirthTwoCount: 0,
        currentlyFishing: null,
        currentSkill: null,
        evil: 0,
    });
    const update = (paused, autoTrain, autoFish) => {
        if (paused) {
            return;
        }
        increaseDay();
        updateCurrentFish();
        updateCurrentSkill();
        updateItemExpenses();
        if (autoTrain) {
            autoSetCurrentSkill();
        }
        if (autoFish) {
            autoSetCurrentlyFishing();
        }
    };
    const getGameData = () => {
        let data_value;
        GameData.subscribe((data) => {
            data_value = data;
        });
        return data_value;
    };
    const setGameData = (savedGameData) => {
        let skill = savedGameData.currentSkill;
        let fish = savedGameData.currentlyFishing;
        GameData.set(Object.assign(Object.assign({}, savedGameData), { currentSkill: new Skill(skill.baseData, skill.level, skill.maxLevel, skill.xp, skill.xpMultipliers), currentlyFishing: new Fishing(fish.baseData, fish.level, fish.maxLevel, fish.xp, fish.xpMultipliers) }));
    };
    const increaseDay = () => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { day: data.day + applySpeed(1) });
        });
    };
    const togglePause = () => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { paused: !data.paused });
        });
    };
    const setCurrentlyFishing = (fishingKey) => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { currentlyFishing: data.fishingData.get(fishingKey) });
        });
    };
    const updateCurrentFish = () => {
        GameData.update((data) => {
            let fish = data.currentlyFishing || data.fishingData.get("Sun Fish");
            data.fishingData.get(fish.name).increaseXp();
            fish.increaseXp();
            return Object.assign(Object.assign({}, data), { fishingData: data.fishingData, currentlyFishing: fish, coins: (data.coins += applySpeed(fish.income)) });
        });
    };
    const setCurrentSkill = (skillKey) => {
        GameData.update((data) => {
            let currentSkill = data.skillsData.get(skillKey);
            if (data.autoTrain) {
                currentSkill = lowestLevelSkill(data);
            }
            return Object.assign(Object.assign({}, data), { currentSkill });
        });
    };
    const autoSetCurrentSkill = () => {
        GameData.update((data) => {
            let currentSkill = lowestLevelSkill(data);
            return Object.assign(Object.assign({}, data), { currentSkill });
        });
    };
    const autoSetCurrentlyFishing = () => {
        GameData.update((data) => {
            let currentlyFishing = highestTierFish(data);
            return Object.assign(Object.assign({}, data), { currentlyFishing });
        });
    };
    const updateCurrentSkill = () => {
        GameData.update((data) => {
            let skill = data.currentSkill || data.skillsData.get("Strength");
            data.skillsData.get(skill.name).increaseXp();
            skill.increaseXp();
            return Object.assign(Object.assign({}, data), { skillsData: data.skillsData });
        });
    };
    const subtractCoins = (amount) => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { coins: (data.coins -= amount) });
        });
    };
    const updateItemExpenses = () => {
        GameData.update((data) => {
            if (data.coins <= 0) {
                data.itemData.forEach((item) => item.deselect());
                return Object.assign(Object.assign({}, data), { coins: 0, itemData: data.itemData });
            }
            return Object.assign(Object.assign({}, data), { coins: (data.coins -= applySpeed(getTotalExpenses(data))) });
        });
    };
    const rebirthReset = () => {
        GameData.update((data) => {
            data.fishingData.forEach((fish) => {
                if (fish.level > fish.maxLevel) {
                    fish.maxLevel = fish.level;
                }
                fish.level = 0;
                fish.xp = 0;
            });
            data.skillsData.forEach((skill) => {
                if (skill.level > skill.maxLevel) {
                    skill.maxLevel = skill.level;
                }
                skill.level = 0;
                skill.xp = 0;
            });
            data.boatData.forEach((boat) => {
                boat.baseData.bought = false;
            });
            data.itemData.forEach((item) => {
                item.level = 0;
                item.deselect();
            });
            return Object.assign(Object.assign({}, data), { coins: 0, day: 365 * 14, currentlyFishing: data.fishingData.get("Black Drum"), currentSkill: data.skillsData.get("Strength") });
        });
    };
    const hardReset = () => {
        window.localStorage.clear();
        window.location.reload();
    };
    const toggleTrain = () => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { autoTrain: !data.autoTrain });
        });
    };
    const toggleFish = () => {
        GameData.update((data) => {
            return Object.assign(Object.assign({}, data), { autoFish: !data.autoFish });
        });
    };
    let tempData = {
        requirements: {},
    };
    const updateSpeed = 20;
    const baseLifespan = 365 * 70;
    const baseGameSpeed = 10;
    const fishBaseData = new Map(
    // Lake
    // 1. Sun Fish
    // 2. Perch
    // 3. Bass
    // 4. Trout
    // 4. Waleye
    // 5. Northern Pike
    // 6. Lake Sturgeon
    [
        [
            "Sun Fish",
            {
                name: "Sun Fish",
                maxXp: 50,
                income: 5,
                effect: 0.01,
                description: "Fishing Pay",
                category: "lake",
            },
        ],
        [
            "Perch",
            {
                name: "Perch",
                maxXp: 100,
                income: 9,
                effect: 0.01,
                description: "Jigging Xp",
                category: "lake",
            },
        ],
        [
            "Bass",
            {
                name: "Bass",
                maxXp: 200,
                income: 15,
                effect: 0.01,
                description: "Casting Xp",
                category: "lake",
            },
        ],
        [
            "Trout",
            {
                name: "Trout",
                maxXp: 400,
                income: 40,
                effect: 0.01,
                description: "Concentration Xp",
                category: "lake",
            },
        ],
        [
            "Waleye",
            {
                name: "Waleye",
                maxXp: 800,
                income: 80,
                effect: 0.01,
                description: "Hooking Xp",
                category: "lake",
            },
        ],
        [
            "Northern Pike",
            {
                name: "Northern Pike",
                maxXp: 1600,
                income: 150,
                effect: 0.01,
                description: "Trolling Xp",
                category: "lake",
            },
        ],
        [
            "Lake Sturgeon",
            {
                name: "Lake Sturgeon",
                maxXp: 3200,
                income: 300,
                effect: 0.01,
                description: "Fishing Pay",
                category: "lake",
            },
        ],
        // River
        // 1. Pirana
        // 2. Salmon
        // 2. Silver Drum
        // 3. Armoured Catfish
        // 4. Electric Eel
        // 5. Pacu
        // 6. Payara
        [
            "Pirana",
            {
                name: "Pirana",
                maxXp: 100,
                income: 5,
                effect: 0.01,
                description: "Ambition Xp",
                category: "river",
            },
        ],
        [
            "Salmon",
            {
                name: "Salmon",
                maxXp: 1000,
                income: 50,
                effect: 0.01,
                description: "Patience Xp",
                category: "river",
            },
        ],
        [
            "Silver Drum",
            {
                name: "Silver Drum",
                maxXp: 10000,
                income: 120,
                effect: 0.01,
                description: "Intelligence Xp",
                category: "river",
            },
        ],
        [
            "Armoured Catfish",
            {
                name: "Armoured Catfish",
                maxXp: 100000,
                income: 300,
                effect: 0.01,
                description: "Reeling Xp",
                category: "river",
            },
        ],
        [
            "Electric Eel",
            {
                name: "Electric Eel",
                maxXp: 1000000,
                income: 1000,
                effect: 0.01,
                description: "River Xp",
                category: "river",
            },
        ],
        [
            "Pacu",
            {
                name: "Pacu",
                maxXp: 7500000,
                income: 300,
                effect: 0.01,
                description: "Concentration Xp",
                category: "river",
            },
        ],
        [
            "Payara",
            {
                name: "Payara",
                maxXp: 4 * Math.pow(10, 7),
                income: 15000,
                effect: 0.01,
                description: "River Pay",
                category: "river",
            },
        ],
        // Ocean
        // 1. Cod
        // 2. Mackerel
        // 2. Angle Fish
        // 4. Grouper
        // Stingray
        // 6. Barracuda
        // 3. Bluefin tuna
        // 5. Blue Marlin
        // Swordfish
        // Shark
        // Whale
        [
            "Cod",
            {
                name: "Cod",
                maxXp: 100000,
                income: 100,
                effect: 0.01,
                description: "Hooking Xp",
                category: "ocean",
            },
        ],
        [
            "Mackerel",
            {
                name: "Mackerel",
                maxXp: Math.pow(10, 6),
                income: 1000,
                effect: 0.01,
                description: "Sailing Xp",
                category: "ocean",
            },
        ],
        [
            "Angle Fish",
            {
                name: "Angle Fish",
                maxXp: Math.pow(10, 7),
                income: 7500,
                effect: 0.01,
                description: "Payara Pay",
                category: "ocean",
            },
        ],
        [
            "Grouper",
            {
                name: "Grouper",
                maxXp: Math.pow(10, 8),
                income: 50000,
                effect: 0.01,
                description: "Strength Xp",
                category: "ocean",
            },
        ],
        [
            "Stingray",
            {
                name: "Stingray",
                maxXp: Math.pow(10, 9),
                income: 100000,
                effect: 0.01,
                description: "Reeling Xp",
                category: "ocean",
            },
        ],
        [
            "Barracuda",
            {
                name: "Barracuda",
                maxXp: Math.pow(10, 10),
                income: 200000,
                effect: 0.01,
                description: "Trolling Xp",
                category: "ocean",
            },
        ],
        [
            "Bluefin Tuna",
            {
                name: "Bluefin Tuna",
                maxXp: Math.pow(10, 11),
                income: 400000,
                effect: 0.01,
                description: "Patience Xp",
                category: "ocean",
            },
        ],
        [
            "Blue Marlin",
            {
                name: "Blue Marlin",
                maxXp: Math.pow(10, 12),
                income: 800000,
                effect: 0.01,
                description: "Communication Xp",
                category: "ocean",
            },
        ],
        [
            "Swordfish",
            {
                name: "Swordfish",
                maxXp: Math.pow(10, 13),
                income: 1600000,
                effect: 0.01,
                description: "Navigation Xp",
                category: "ocean",
            },
        ],
        [
            "Shark",
            {
                name: "Shark",
                maxXp: Math.pow(10, 13),
                income: 2400000,
                effect: 0.01,
                description: "All Xp",
                category: "ocean",
            },
        ],
        [
            "Whale",
            {
                name: "Whale",
                maxXp: Math.pow(10, 13),
                income: 3200000,
                effect: 0.01,
                description: "All Xp",
                category: "ocean",
            },
        ],
    ]);
    const skillBaseData = new Map([
        // FUNDAMENTALS //
        // Strength
        // Concentration
        // Intelligence
        // Patience
        // Ambition
        // Communication
        [
            "Strength",
            {
                name: "Strength",
                maxXp: 100,
                effect: 0.01,
                description: "Fishing Xp",
                category: "fundamentals",
            },
        ],
        [
            "Concentration",
            {
                name: "Concentration",
                maxXp: 100,
                effect: 0.01,
                description: "Skill Xp",
                category: "fundamentals",
            },
        ],
        [
            "Intelligence",
            {
                name: "Intelligence",
                maxXp: 100,
                effect: 0.01,
                description: "River Xp",
                category: "fundamentals",
            },
        ],
        [
            "Patience",
            {
                name: "Patience",
                maxXp: 100,
                effect: 0.01,
                description: "Lake Pay",
                category: "fundamentals",
            },
        ],
        [
            "Ambition",
            {
                name: "Ambition",
                maxXp: 100,
                effect: 0.01,
                description: "River Pay",
                category: "fundamentals",
            },
        ],
        [
            "Communication",
            {
                name: "Communication",
                maxXp: 100,
                effect: 0.01,
                description: "Ocean Pay",
                category: "fundamentals",
            },
        ],
        // FISHING SKILLS
        // Casting
        // Jigging
        // Trolling
        // Reeling
        // Hooking
        // Netting
        // Whaling
        [
            "Casting",
            {
                name: "Casting",
                maxXp: 100,
                effect: 0.01,
                description: "Lake Xp",
                category: "fishing",
            },
        ],
        [
            "Jigging",
            {
                name: "Jigging",
                maxXp: 100,
                effect: 0.01,
                description: "Lake Pay",
                category: "fishing",
            },
        ],
        [
            "Trolling",
            {
                name: "Trolling",
                maxXp: 100,
                effect: 0.01,
                description: "Northern Pay",
                category: "fishing",
            },
        ],
        [
            "Reeling",
            {
                name: "Reeling",
                maxXp: 100,
                effect: 0.01,
                description: "Northern Pay",
                category: "fishing",
            },
        ],
        [
            "Hooking",
            {
                name: "Hooking",
                maxXp: 100,
                effect: 0.01,
                description: "River Pay",
                category: "fishing",
            },
        ],
        [
            "Netting",
            {
                name: "Netting",
                maxXp: 100,
                effect: 0.01,
                description: "Ocean Pay",
                category: "fishing",
            },
        ],
        [
            "Whaling",
            {
                name: "Whaling",
                maxXp: 100,
                effect: 0.01,
                description: "Whale Pay",
                category: "fishing",
            },
        ],
        // Boating Skills
        // Docking
        // Turning
        // Anchoring
        // Sailing
        // Navigation
        // Stability
        [
            "Docking",
            {
                name: "Docking",
                maxXp: 100,
                effect: 0.01,
                description: "Skill Xp",
                category: "boating",
            },
        ],
        [
            "Turning",
            {
                name: "Turning",
                maxXp: 100,
                effect: 0.01,
                description: "River Xp",
                category: "boating",
            },
        ],
        [
            "Anchoring",
            {
                name: "Anchoring",
                maxXp: 100,
                effect: 0.01,
                description: "Lake Xp",
                category: "boating",
            },
        ],
        [
            "Sailing",
            {
                name: "Sailing",
                maxXp: 100,
                effect: 0.01,
                description: "Ocean Xp",
                category: "boating",
            },
        ],
        [
            "Navigation",
            {
                name: "Navigation",
                maxXp: 100,
                effect: 0.01,
                description: "Whale Pay",
                category: "boating",
            },
        ],
        [
            "Stability",
            {
                name: "Stability",
                maxXp: 100,
                effect: 0.01,
                description: "Fishing Pay",
                category: "boating",
            },
        ],
    ]);
    const boatBaseData = new Map([
        [
            "Row Boat",
            {
                name: "Row Boat",
                price: 300,
                bought: false,
            },
        ],
        [
            "Silver Bullet",
            {
                name: "Silver Bullet",
                price: 1500,
                bought: false,
            },
        ],
        [
            "Bass Boat",
            {
                name: "Bass Boat",
                price: 30000,
                bought: false,
            },
        ],
        [
            "Canoe",
            {
                name: "Canoe",
                price: 100000,
                bought: false,
            },
        ],
        [
            "River Skiff",
            {
                name: "River Skiff",
                price: 300000,
                bought: false,
            },
        ],
        [
            "Airboat",
            {
                name: "Airboat",
                price: 900000,
                bought: false,
            },
        ],
        [
            "Sail Boat",
            {
                name: "Sail Boat",
                price: 2700000,
                bought: false,
            },
        ],
        [
            "Yacht",
            {
                name: "Yacht",
                price: 8100000,
                bought: false,
            },
        ],
        [
            "Whaling Ship",
            {
                name: "Whaling Ship",
                price: 30000000,
                bought: false,
            },
        ],
        // BOATS //
        // Row Boat
        // Silver Bullet
        // Bass Boat
        // Canoe
        // River Skiff
        // Airboat
        // Sail Boat
        // Yacht
        // Whaling Ship
    ]);
    const itemBaseData = new Map([
        // ITEMS //
        // Rod
        // Book
        // Net
        // Hook
        // Bait
        // Ham Sandwich
        // Pliers
        // Fish Finder
        // House
        [
            "Rod",
            {
                name: "Rod",
                expense: 10,
                effect: 1.5,
                description: "Strength Xp",
                selected: false,
                upgradePrice: 200,
            },
        ],
        [
            "Book",
            {
                name: "Book",
                expense: 50,
                effect: 1.5,
                description: "Skill Xp",
                selected: false,
                upgradePrice: 1000,
            },
        ],
        [
            "Net",
            {
                name: "Net",
                expense: 200,
                effect: 2,
                description: "Fishing Xp",
                selected: false,
                upgradePrice: 3000,
            },
        ],
        [
            "Hook",
            {
                name: "Hook",
                expense: 1000,
                effect: 2,
                description: "River Xp",
                selected: false,
                upgradePrice: 5000,
            },
        ],
        [
            "Bait",
            {
                name: "Bait",
                expense: 7500,
                effect: 1.5,
                description: "All Xp",
                selected: false,
                upgradePrice: 8000,
            },
        ],
        [
            "Ham Sandwich",
            {
                name: "Ham Sandwich",
                expense: 50000,
                effect: 3,
                description: "Boating Xp",
                selected: false,
                upgradePrice: 10000,
            },
        ],
        [
            "Pliers",
            {
                name: "Pliers",
                expense: 1000000,
                effect: 2,
                description: "Skill Xp",
                selected: false,
                upgradePrice: 15000,
            },
        ],
        [
            "Fish Finder",
            {
                name: "Fish Finder",
                expense: Math.pow(10, 7),
                effect: 1.5,
                description: "Skill Xp",
                selected: false,
                upgradePrice: 20000,
            },
        ],
        [
            "House",
            {
                name: "House",
                expense: Math.pow(10, 8),
                effect: 3,
                description: "All Xp",
                selected: false,
                upgradePrice: 200000,
            },
        ],
    ]);
    const fishCategories = {
        lake: ["Sun Fish", "Perch"],
        river: ["Trout", "P"],
        ocean: ["Cod", "Mackerel"],
    };
    const skillCategories = {
        fundamentals: ["Strength", "Concentration"],
        fishing: [],
        boating: [],
    };
    const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];
    document.getElementById("jobTabButton");

    /* src/tabs/Achievements.svelte generated by Svelte v3.42.2 */
    const file$f = "src/tabs/Achievements.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Achievements!";
    			attr_dev(p, "class", "p-10 bg-yellow-500");
    			add_location(p, file$f, 9, 2, 187);
    			attr_dev(div, "class", "bg-red-300 w-full h-full");
    			add_location(div, file$f, 8, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Achievements', slots, []);
    	
    	let data_value;

    	GameData.subscribe(data => {
    		data_value = data;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Achievements> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GameData, data_value });

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) data_value = $$props.data_value;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Achievements extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Achievements",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/ProgressTable.svelte generated by Svelte v3.42.2 */
    const file$e = "src/components/ProgressTable.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (11:4) {#each headers as header, idx}
    function create_each_block$8(ctx) {
    	let th;
    	let t_value = capitalize(/*header*/ ctx[4]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			set_style(th, "background-color", /*headerColor*/ ctx[1]);
    			attr_dev(th, "class", "svelte-1dkf90n");
    			add_location(th, file$e, 11, 6, 404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*headers*/ 1 && t_value !== (t_value = capitalize(/*header*/ ctx[4]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*headerColor*/ 2) {
    				set_style(th, "background-color", /*headerColor*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(11:4) {#each headers as header, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let table;
    	let tr;
    	let t;
    	let current;
    	let each_value = /*headers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(tr, "class", "mt-4 mb-1 svelte-1dkf90n");
    			add_location(tr, file$e, 9, 2, 340);
    			attr_dev(table, "class", "w-full svelte-1dkf90n");
    			add_location(table, file$e, 8, 0, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(table, t);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*headerColor, capitalize, headers*/ 3) {
    				each_value = /*headers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressTable', slots, ['default']);
    	let { headers = ["Unknown"] } = $$props;
    	let { headerColor = "#04aa6d" } = $$props;
    	const writable_props = ['headers', 'headerColor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('headers' in $$props) $$invalidate(0, headers = $$props.headers);
    		if ('headerColor' in $$props) $$invalidate(1, headerColor = $$props.headerColor);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ headers, headerColor, capitalize });

    	$$self.$inject_state = $$props => {
    		if ('headers' in $$props) $$invalidate(0, headers = $$props.headers);
    		if ('headerColor' in $$props) $$invalidate(1, headerColor = $$props.headerColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headers, headerColor, $$scope, slots];
    }

    class ProgressTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { headers: 0, headerColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressTable",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get headers() {
    		throw new Error("<ProgressTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headers(value) {
    		throw new Error("<ProgressTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerColor() {
    		throw new Error("<ProgressTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerColor(value) {
    		throw new Error("<ProgressTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/XpBar.svelte generated by Svelte v3.42.2 */

    const file$d = "src/components/XpBar.svelte";

    // (11:6) {#if level}
    function create_if_block$c(ctx) {
    	let t_value = ` lvl ${/*level*/ ctx[2]}` + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*level*/ 4 && t_value !== (t_value = ` lvl ${/*level*/ ctx[2]}` + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(11:6) {#if level}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let td;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let div1_class_value;
    	let div2_class_value;
    	let if_block = /*level*/ ctx[2] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "text-top svelte-19666ug");
    			add_location(div0, file$d, 8, 4, 216);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(`progress ${/*selected*/ ctx[3] ? "bg-pink-900" : "bg-purple-500"}`) + " svelte-19666ug"));
    			set_style(div1, "width", /*width*/ ctx[1] + "%");
    			set_style(div1, "height", "100%");
    			add_location(div1, file$d, 14, 4, 323);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`bar ${/*selected*/ ctx[3] ? "bg-purple-800" : "bg-purple-800"} p-2`) + " svelte-19666ug"));
    			add_location(div2, file$d, 7, 2, 140);
    			add_location(td, file$d, 6, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (/*level*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*selected*/ 8 && div1_class_value !== (div1_class_value = "" + (null_to_empty(`progress ${/*selected*/ ctx[3] ? "bg-pink-900" : "bg-purple-500"}`) + " svelte-19666ug"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*width*/ 2) {
    				set_style(div1, "width", /*width*/ ctx[1] + "%");
    			}

    			if (dirty & /*selected*/ 8 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`bar ${/*selected*/ ctx[3] ? "bg-purple-800" : "bg-purple-800"} p-2`) + " svelte-19666ug"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('XpBar', slots, []);
    	let { name = "" } = $$props;
    	let { width = 10 } = $$props;
    	let { level = undefined } = $$props;
    	let { selected = false } = $$props;
    	const writable_props = ['name', 'width', 'level', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<XpBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('level' in $$props) $$invalidate(2, level = $$props.level);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ name, width, level, selected });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('level' in $$props) $$invalidate(2, level = $$props.level);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, width, level, selected];
    }

    class XpBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 0, width: 1, level: 2, selected: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "XpBar",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get name() {
    		throw new Error("<XpBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<XpBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<XpBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<XpBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		throw new Error("<XpBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set level(value) {
    		throw new Error("<XpBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<XpBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<XpBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Coins.svelte generated by Svelte v3.42.2 */
    const file$c = "src/components/Coins.svelte";

    // (17:30) 
    function create_if_block_4$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "+";
    			attr_dev(p, "class", "text-green-500 text-xl");
    			add_location(p, file$c, 17, 4, 440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(17:30) ",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if negative}
    function create_if_block_3$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "-";
    			attr_dev(p, "class", "text-red-500 text-xl");
    			add_location(p, file$c, 15, 4, 367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(15:2) {#if negative}",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#if coins.p > 0}
    function create_if_block_2$4(ctx) {
    	let p;
    	let t0_value = /*coins*/ ctx[2].p + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("p");
    			attr_dev(p, "class", "text-blue-500 w-1/4");
    			add_location(p, file$c, 20, 4, 512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coins*/ 4 && t0_value !== (t0_value = /*coins*/ ctx[2].p + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(20:2) {#if coins.p > 0}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if coins.g > 0 || coins.p > 0}
    function create_if_block_1$7(ctx) {
    	let p;
    	let t0_value = /*coins*/ ctx[2].g + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("g");
    			attr_dev(p, "class", "text-yellow-400 w-1/4");
    			add_location(p, file$c, 23, 4, 605);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coins*/ 4 && t0_value !== (t0_value = /*coins*/ ctx[2].g + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(23:2) {#if coins.g > 0 || coins.p > 0}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if coins.s > 0 || coins.g > 0 || coins.p > 0}
    function create_if_block$b(ctx) {
    	let p;
    	let t0_value = /*coins*/ ctx[2].s + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("s");
    			attr_dev(p, "class", "text-gray-300 w-1/4");
    			add_location(p, file$c, 26, 4, 715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coins*/ 4 && t0_value !== (t0_value = /*coins*/ ctx[2].s + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(26:2) {#if coins.s > 0 || coins.g > 0 || coins.p > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*coins*/ ctx[2].c + "";
    	let t4;
    	let t5;
    	let span_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*negative*/ ctx[1]) return create_if_block_3$3;
    		if (/*negative*/ ctx[1] == false) return create_if_block_4$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*coins*/ ctx[2].p > 0 && create_if_block_2$4(ctx);
    	let if_block2 = (/*coins*/ ctx[2].g > 0 || /*coins*/ ctx[2].p > 0) && create_if_block_1$7(ctx);
    	let if_block3 = (/*coins*/ ctx[2].s > 0 || /*coins*/ ctx[2].g > 0 || /*coins*/ ctx[2].p > 0) && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = text("c");
    			attr_dev(p, "class", "text-yellow-800 w-1/4");
    			add_location(p, file$c, 28, 2, 771);
    			attr_dev(span, "class", span_class_value = `flex justify-start items-center ${/*large*/ ctx[0] ? "text-2xl" : "text-lg"}`);
    			add_location(span, file$c, 11, 0, 260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t0);
    			if (if_block1) if_block1.m(span, null);
    			append_dev(span, t1);
    			if (if_block2) if_block2.m(span, null);
    			append_dev(span, t2);
    			if (if_block3) if_block3.m(span, null);
    			append_dev(span, t3);
    			append_dev(span, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(span, t0);
    				}
    			}

    			if (/*coins*/ ctx[2].p > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$4(ctx);
    					if_block1.c();
    					if_block1.m(span, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*coins*/ ctx[2].g > 0 || /*coins*/ ctx[2].p > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$7(ctx);
    					if_block2.c();
    					if_block2.m(span, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*coins*/ ctx[2].s > 0 || /*coins*/ ctx[2].g > 0 || /*coins*/ ctx[2].p > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$b(ctx);
    					if_block3.c();
    					if_block3.m(span, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*coins*/ 4 && t4_value !== (t4_value = /*coins*/ ctx[2].c + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*large*/ 1 && span_class_value !== (span_class_value = `flex justify-start items-center ${/*large*/ ctx[0] ? "text-2xl" : "text-lg"}`)) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Coins', slots, []);
    	let { amount } = $$props;
    	let { large = false } = $$props;
    	let { negative = undefined } = $$props;
    	let coins;

    	beforeUpdate(() => {
    		$$invalidate(2, coins = coinAmounts(amount));
    	});

    	const writable_props = ['amount', 'large', 'negative'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Coins> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('amount' in $$props) $$invalidate(3, amount = $$props.amount);
    		if ('large' in $$props) $$invalidate(0, large = $$props.large);
    		if ('negative' in $$props) $$invalidate(1, negative = $$props.negative);
    	};

    	$$self.$capture_state = () => ({
    		coinAmounts,
    		beforeUpdate,
    		amount,
    		large,
    		negative,
    		coins
    	});

    	$$self.$inject_state = $$props => {
    		if ('amount' in $$props) $$invalidate(3, amount = $$props.amount);
    		if ('large' in $$props) $$invalidate(0, large = $$props.large);
    		if ('negative' in $$props) $$invalidate(1, negative = $$props.negative);
    		if ('coins' in $$props) $$invalidate(2, coins = $$props.coins);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [large, negative, coins, amount];
    }

    class Coins extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { amount: 3, large: 0, negative: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Coins",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*amount*/ ctx[3] === undefined && !('amount' in props)) {
    			console.warn("<Coins> was created without expected prop 'amount'");
    		}
    	}

    	get amount() {
    		throw new Error("<Coins>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Coins>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Coins>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Coins>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get negative() {
    		throw new Error("<Coins>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set negative(value) {
    		throw new Error("<Coins>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FishBars.svelte generated by Svelte v3.42.2 */
    const file$b = "src/components/FishBars.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (29:2) {#if !needRequirements(data_value, fish)}
    function create_if_block$a(ctx) {
    	let tr;
    	let xpbar;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	xpbar = new XpBar({
    			props: {
    				name: /*fish*/ ctx[5].name,
    				width: /*fish*/ ctx[5].barWidth,
    				selected: /*data_value*/ ctx[1].currentlyFishing.name === /*fish*/ ctx[5].name
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*getValues*/ ctx[3](/*fish*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$6(get_each_context_1$6(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*fish*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			create_component(xpbar.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(tr, "class", "cursor-pointer");
    			add_location(tr, file$b, 29, 4, 858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component(xpbar, tr, null);
    			append_dev(tr, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const xpbar_changes = {};
    			if (dirty & /*data_value, allFish*/ 3) xpbar_changes.name = /*fish*/ ctx[5].name;
    			if (dirty & /*data_value, allFish*/ 3) xpbar_changes.width = /*fish*/ ctx[5].barWidth;
    			if (dirty & /*data_value, allFish*/ 3) xpbar_changes.selected = /*data_value*/ ctx[1].currentlyFishing.name === /*fish*/ ctx[5].name;
    			xpbar.$set(xpbar_changes);

    			if (dirty & /*getValues, filtered, data_value, allFish*/ 11) {
    				each_value_1 = /*getValues*/ ctx[3](/*fish*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$6(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(xpbar.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(xpbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(xpbar);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(29:2) {#if !needRequirements(data_value, fish)}",
    		ctx
    	});

    	return block;
    }

    // (39:8) {:else}
    function create_else_block$3(ctx) {
    	let td;
    	let t_value = /*value*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$b, 39, 10, 1205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, allFish*/ 3 && t_value !== (t_value = /*value*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(39:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#if idx == 1}
    function create_if_block_1$6(ctx) {
    	let td;
    	let coins;
    	let current;

    	coins = new Coins({
    			props: { amount: /*value*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(coins.$$.fragment);
    			add_location(td, file$b, 37, 10, 1145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(coins, td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coins_changes = {};
    			if (dirty & /*data_value, allFish*/ 3) coins_changes.amount = /*value*/ ctx[8];
    			coins.$set(coins_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(coins);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(37:8) {#if idx == 1}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#each getValues(fish) as value, idx}
    function create_each_block_1$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*idx*/ ctx[7] == 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$6.name,
    		type: "each",
    		source: "(36:6) {#each getValues(fish) as value, idx}",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#each filtered(data_value, allFish) as fish, idx}
    function create_each_block$7(ctx) {
    	let show_if = !needRequirements(/*data_value*/ ctx[1], /*fish*/ ctx[5]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, allFish*/ 3) show_if = !needRequirements(/*data_value*/ ctx[1], /*fish*/ ctx[5]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value, allFish*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(28:0) {#each filtered(data_value, allFish) as fish, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = filtered(/*data_value*/ ctx[1], /*allFish*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*setCurrent, filtered, data_value, allFish, getValues, needRequirements*/ 15) {
    				each_value = filtered(/*data_value*/ ctx[1], /*allFish*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FishBars', slots, []);
    	
    	
    	let data_value;
    	let { allFish = [] } = $$props;

    	GameData.subscribe(data => {
    		$$invalidate(1, data_value = data);
    	});

    	const setCurrent = name => {
    		setCurrentlyFishing(name);
    	};

    	const getValues = fish => {
    		// ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]
    		return [
    			fish.level,
    			fish.income,
    			fish.effectDescription,
    			formatNumber(fish.xpGain),
    			formatNumber(fish.xpLeft),
    			fish.maxLevel
    		];
    	};

    	const writable_props = ['allFish'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FishBars> was created with unknown prop '${key}'`);
    	});

    	const click_handler = fish => setCurrent(fish.name);

    	$$self.$$set = $$props => {
    		if ('allFish' in $$props) $$invalidate(0, allFish = $$props.allFish);
    	};

    	$$self.$capture_state = () => ({
    		fishBaseData,
    		GameData,
    		setCurrentlyFishing,
    		filtered,
    		formatNumber,
    		getRequiredString,
    		needRequirements,
    		XpBar,
    		Coins,
    		data_value,
    		allFish,
    		setCurrent,
    		getValues
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(1, data_value = $$props.data_value);
    		if ('allFish' in $$props) $$invalidate(0, allFish = $$props.allFish);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [allFish, data_value, setCurrent, getValues, click_handler];
    }

    class FishBars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { allFish: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FishBars",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get allFish() {
    		throw new Error("<FishBars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allFish(value) {
    		throw new Error("<FishBars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/RequiredBar.svelte generated by Svelte v3.42.2 */
    const file$a = "src/components/RequiredBar.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (42:6) {:else}
    function create_else_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Unknown";
    			add_location(span, file$a, 42, 8, 1430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(42:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:36) 
    function create_if_block_3$2(ctx) {
    	let span;
    	let coins;
    	let t;
    	let current;

    	coins = new Coins({
    			props: {
    				amount: /*sameTypeReq*/ ctx[8].requirement,
    				large: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(coins.$$.fragment);
    			t = space();
    			attr_dev(span, "class", "w-1/4");
    			add_location(span, file$a, 38, 8, 1305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(coins, span, null);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coins_changes = {};
    			if (dirty & /*reqs*/ 1) coins_changes.amount = /*sameTypeReq*/ ctx[8].requirement;
    			coins.$set(coins_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(coins);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(38:36) ",
    		ctx
    	});

    	return block;
    }

    // (36:35) 
    function create_if_block_2$3(ctx) {
    	let span;
    	let t_value = /*sameTypeReq*/ ctx[8].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 36, 8, 1228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*reqs*/ 1 && t_value !== (t_value = /*sameTypeReq*/ ctx[8].name + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(36:35) ",
    		ctx
    	});

    	return block;
    }

    // (34:34) 
    function create_if_block_1$5(ctx) {
    	let span;
    	let t_value = /*ageString*/ ctx[2](/*sameTypeReq*/ ctx[8]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 34, 8, 1146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*reqs*/ 1 && t_value !== (t_value = /*ageString*/ ctx[2](/*sameTypeReq*/ ctx[8]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(34:34) ",
    		ctx
    	});

    	return block;
    }

    // (32:6) {#if ["fishing", "skill"].includes(req.type)}
    function create_if_block$9(ctx) {
    	let span;
    	let t_value = /*taskString*/ ctx[1](/*sameTypeReq*/ ctx[8], /*req*/ ctx[5].type) + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 32, 8, 1054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*reqs*/ 1 && t_value !== (t_value = /*taskString*/ ctx[1](/*sameTypeReq*/ ctx[8], /*req*/ ctx[5].type) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(32:6) {#if [\\\"fishing\\\", \\\"skill\\\"].includes(req.type)}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#each req.requirements as sameTypeReq}
    function create_each_block_1$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$9,
    		create_if_block_1$5,
    		create_if_block_2$3,
    		create_if_block_3$2,
    		create_else_block$2
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*reqs*/ 1) show_if = !!["fishing", "skill"].includes(/*req*/ ctx[5].type);
    		if (show_if) return 0;
    		if (/*req*/ ctx[5].type == "age") return 1;
    		if (/*req*/ ctx[5].type == "boat") return 2;
    		if (/*req*/ ctx[5].type == "coins") return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(31:4) {#each req.requirements as sameTypeReq}",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#each reqs as req}
    function create_each_block$6(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*req*/ ctx[5].requirements;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taskString, reqs, ageString*/ 7) {
    				each_value_1 = /*req*/ ctx[5].requirements;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(30:2) {#each reqs as req}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let span;
    	let t1;
    	let current;
    	let each_value = /*reqs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Required:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "font-bold");
    			add_location(span, file$a, 28, 2, 886);
    			attr_dev(div, "class", "w-full mb-8 flex justify-between text-lg");
    			add_location(div, file$a, 27, 0, 829);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*reqs, taskString, ageString*/ 7) {
    				each_value = /*reqs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RequiredBar', slots, []);
    	
    	
    	let { taskOrItem } = $$props;
    	let data_value;

    	GameData.subscribe(data => {
    		data_value = data;
    	});

    	let reqs = data_value.requirements.get(taskOrItem.name);

    	beforeUpdate(() => {
    		$$invalidate(0, reqs = data_value.requirements.get(taskOrItem.name));
    	});

    	const taskString = (requirement, type) => {
    		let name = requirement.name;

    		let levelNow = type == "skill"
    		? data_value.skillsData.get(name).level
    		: data_value.fishingData.get(name).level;

    		return `${name} level ${levelNow}/${requirement.requirement} `;
    	};

    	const ageString = requirement => {
    		return `${daysToYears(requirement.requirement)} years old `;
    	};

    	const writable_props = ['taskOrItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RequiredBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('taskOrItem' in $$props) $$invalidate(3, taskOrItem = $$props.taskOrItem);
    	};

    	$$self.$capture_state = () => ({
    		GameData,
    		Coins,
    		daysToYears,
    		beforeUpdate,
    		taskOrItem,
    		data_value,
    		reqs,
    		taskString,
    		ageString
    	});

    	$$self.$inject_state = $$props => {
    		if ('taskOrItem' in $$props) $$invalidate(3, taskOrItem = $$props.taskOrItem);
    		if ('data_value' in $$props) data_value = $$props.data_value;
    		if ('reqs' in $$props) $$invalidate(0, reqs = $$props.reqs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [reqs, taskString, ageString, taskOrItem];
    }

    class RequiredBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { taskOrItem: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RequiredBar",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taskOrItem*/ ctx[3] === undefined && !('taskOrItem' in props)) {
    			console.warn("<RequiredBar> was created without expected prop 'taskOrItem'");
    		}
    	}

    	get taskOrItem() {
    		throw new Error("<RequiredBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taskOrItem(value) {
    		throw new Error("<RequiredBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tabs/GoneFishing.svelte generated by Svelte v3.42.2 */

    const { Object: Object_1$1 } = globals;
    const file$9 = "src/tabs/GoneFishing.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (42:6) <ProgressTable {headers}>
    function create_default_slot$2(ctx) {
    	let fishbars;
    	let current;

    	fishbars = new FishBars({
    			props: {
    				allFish: /*getAllFish*/ ctx[2](/*data_value*/ ctx[0].fishingData, /*headers*/ ctx[5][0])
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(fishbars.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fishbars, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fishbars_changes = {};
    			if (dirty & /*data_value*/ 1) fishbars_changes.allFish = /*getAllFish*/ ctx[2](/*data_value*/ ctx[0].fishingData, /*headers*/ ctx[5][0]);
    			fishbars.$set(fishbars_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fishbars.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fishbars.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fishbars, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(42:6) <ProgressTable {headers}>",
    		ctx
    	});

    	return block;
    }

    // (46:8) {#if needRequirements(data_value, fish)}
    function create_if_block$8(ctx) {
    	let requiredbar;
    	let current;

    	requiredbar = new RequiredBar({
    			props: { taskOrItem: /*fish*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(requiredbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(requiredbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const requiredbar_changes = {};
    			if (dirty & /*data_value*/ 1) requiredbar_changes.taskOrItem = /*fish*/ ctx[8];
    			requiredbar.$set(requiredbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(requiredbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(requiredbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(requiredbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(46:8) {#if needRequirements(data_value, fish)}",
    		ctx
    	});

    	return block;
    }

    // (45:6) {#each filtered(data_value, getAllFish(data_value.fishingData, headers[0])) as fish, idx}
    function create_each_block_1$4(ctx) {
    	let show_if = needRequirements(/*data_value*/ ctx[0], /*fish*/ ctx[8]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value*/ 1) show_if = needRequirements(/*data_value*/ ctx[0], /*fish*/ ctx[8]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(45:6) {#each filtered(data_value, getAllFish(data_value.fishingData, headers[0])) as fish, idx}",
    		ctx
    	});

    	return block;
    }

    // (40:2) {#each allHeaders as headers}
    function create_each_block$5(ctx) {
    	let div;
    	let progresstable;
    	let t0;
    	let t1;
    	let current;

    	progresstable = new ProgressTable({
    			props: {
    				headers: /*headers*/ ctx[5],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = filtered(/*data_value*/ ctx[0], /*getAllFish*/ ctx[2](/*data_value*/ ctx[0].fishingData, /*headers*/ ctx[5][0]));
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progresstable.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(div, "class", "mb-3");
    			add_location(div, file$9, 40, 4, 1057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progresstable, div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progresstable_changes = {};

    			if (dirty & /*$$scope, data_value*/ 2049) {
    				progresstable_changes.$$scope = { dirty, ctx };
    			}

    			progresstable.$set(progresstable_changes);

    			if (dirty & /*filtered, data_value, getAllFish, allHeaders, needRequirements*/ 7) {
    				each_value_1 = filtered(/*data_value*/ ctx[0], /*getAllFish*/ ctx[2](/*data_value*/ ctx[0].fishingData, /*headers*/ ctx[5][0]));
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresstable.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresstable.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progresstable);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(40:2) {#each allHeaders as headers}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	let each_value = /*allHeaders*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "w-full h-full bg-gray-700 p-2 mt-2");
    			add_location(div, file$9, 38, 0, 972);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filtered, data_value, getAllFish, allHeaders, needRequirements*/ 7) {
    				each_value = /*allHeaders*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GoneFishing', slots, []);
    	
    	
    	let data_value;
    	let fishingData;
    	let commonHeaders = ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"];
    	let allHeaders = [[]];

    	onMount(() => {
    		Object.keys(fishCategories).forEach(key => {
    			allHeaders.push([key, ...commonHeaders]);
    		});
    	});

    	GameData.subscribe(data => {
    		$$invalidate(0, data_value = data);
    	});

    	const getAllFish = (fishingData, cateogry) => {
    		let fishArr = [];

    		fishingData.forEach(fish => {
    			if (fish.baseData.category == cateogry) {
    				fishArr.push(fish);
    			}
    		});

    		return fishArr;
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GoneFishing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ProgressTable,
    		GameData,
    		fishCategories,
    		FishBars,
    		onMount,
    		filtered,
    		getRequiredString,
    		needRequirements,
    		RequiredBar,
    		data_value,
    		fishingData,
    		commonHeaders,
    		allHeaders,
    		getAllFish
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(0, data_value = $$props.data_value);
    		if ('fishingData' in $$props) fishingData = $$props.fishingData;
    		if ('commonHeaders' in $$props) commonHeaders = $$props.commonHeaders;
    		if ('allHeaders' in $$props) $$invalidate(1, allHeaders = $$props.allHeaders);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data_value, allHeaders, getAllFish];
    }

    class GoneFishing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoneFishing",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/BoatBars.svelte generated by Svelte v3.42.2 */
    const file$8 = "src/components/BoatBars.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (14:2) {#if !needRequirements(data_value, boat)}
    function create_if_block$7(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*boat*/ ctx[3].baseData.name + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = (/*boat*/ ctx[3].bought ? "Purchased" : "") + "";
    	let t2;
    	let t3;
    	let td1;
    	let coins;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	coins = new Coins({
    			props: { amount: /*boat*/ ctx[3].baseData.price },
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*boat*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			create_component(coins.$$.fragment);
    			t4 = space();
    			attr_dev(span, "class", "text-green-400");
    			add_location(span, file$8, 17, 8, 495);
    			add_location(td0, file$8, 15, 6, 453);
    			add_location(td1, file$8, 19, 6, 582);
    			attr_dev(tr, "class", "cursor-pointer");
    			add_location(tr, file$8, 14, 4, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(td0, span);
    			append_dev(span, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			mount_component(coins, td1, null);
    			append_dev(tr, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*data_value, boats*/ 3) && t0_value !== (t0_value = /*boat*/ ctx[3].baseData.name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data_value, boats*/ 3) && t2_value !== (t2_value = (/*boat*/ ctx[3].bought ? "Purchased" : "") + "")) set_data_dev(t2, t2_value);
    			const coins_changes = {};
    			if (dirty & /*data_value, boats*/ 3) coins_changes.amount = /*boat*/ ctx[3].baseData.price;
    			coins.$set(coins_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(coins);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(14:2) {#if !needRequirements(data_value, boat)}",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#each filtered(data_value, boats) as boat}
    function create_each_block$4(ctx) {
    	let show_if = !needRequirements(/*data_value*/ ctx[1], /*boat*/ ctx[3]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, boats*/ 3) show_if = !needRequirements(/*data_value*/ ctx[1], /*boat*/ ctx[3]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value, boats*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(13:0) {#each filtered(data_value, boats) as boat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = filtered(/*data_value*/ ctx[1], /*boats*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filtered, data_value, boats, needRequirements*/ 3) {
    				each_value = filtered(/*data_value*/ ctx[1], /*boats*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BoatBars', slots, []);
    	
    	
    	let data_value;
    	let { boats = [] } = $$props;

    	GameData.subscribe(data => {
    		$$invalidate(1, data_value = data);
    	});

    	const writable_props = ['boats'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BoatBars> was created with unknown prop '${key}'`);
    	});

    	const click_handler = boat => boat.buy();

    	$$self.$$set = $$props => {
    		if ('boats' in $$props) $$invalidate(0, boats = $$props.boats);
    	};

    	$$self.$capture_state = () => ({
    		GameData,
    		Coins,
    		filtered,
    		getRequiredString,
    		needRequirements,
    		data_value,
    		boats
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(1, data_value = $$props.data_value);
    		if ('boats' in $$props) $$invalidate(0, boats = $$props.boats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [boats, data_value, click_handler];
    }

    class BoatBars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { boats: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BoatBars",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get boats() {
    		throw new Error("<BoatBars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boats(value) {
    		throw new Error("<BoatBars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ItemBars.svelte generated by Svelte v3.42.2 */
    const file$7 = "src/components/ItemBars.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (23:2) {#if !needRequirements(data_value, item)}
    function create_if_block$6(ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_1 = /*getValues*/ ctx[2](/*item*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$7, 23, 4, 564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filtered, data_value, items, getValues*/ 7) {
    				each_value_1 = /*getValues*/ ctx[2](/*item*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(23:2) {#if !needRequirements(data_value, item)}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let t_value = /*value*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$7, 41, 10, 1154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, items*/ 3 && t_value !== (t_value = /*value*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(41:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:27) 
    function create_if_block_3$1(ctx) {
    	let td;
    	let coins;
    	let current;

    	coins = new Coins({
    			props: { amount: +/*value*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(coins.$$.fragment);
    			add_location(td, file$7, 37, 10, 1069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(coins, td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coins_changes = {};
    			if (dirty & /*data_value, items*/ 3) coins_changes.amount = +/*value*/ ctx[8];
    			coins.$set(coins_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(coins);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(37:27) ",
    		ctx
    	});

    	return block;
    }

    // (32:27) 
    function create_if_block_2$2(ctx) {
    	let td;
    	let coins;
    	let current;
    	let mounted;
    	let dispose;

    	coins = new Coins({
    			props: { amount: +/*value*/ ctx[8] },
    			$$inline: true
    		});

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*item*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(coins.$$.fragment);
    			attr_dev(td, "class", "cursor-pointer bg-purple-700 text-white hover:bg-purple-800");
    			add_location(td, file$7, 32, 10, 861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(coins, td, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const coins_changes = {};
    			if (dirty & /*data_value, items*/ 3) coins_changes.amount = +/*value*/ ctx[8];
    			coins.$set(coins_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(coins);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(32:27) ",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if idx == 0}
    function create_if_block_1$4(ctx) {
    	let td;
    	let t_value = /*value*/ ctx[8] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "cursor-pointer bg-purple-400 text-white");
    			toggle_class(td, "bg-pink-900", /*item*/ ctx[5].selected);
    			add_location(td, file$7, 26, 10, 646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data_value, items*/ 3 && t_value !== (t_value = /*value*/ ctx[8] + "")) set_data_dev(t, t_value);

    			if (dirty & /*filtered, data_value, items*/ 3) {
    				toggle_class(td, "bg-pink-900", /*item*/ ctx[5].selected);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(26:8) {#if idx == 0}",
    		ctx
    	});

    	return block;
    }

    // (25:6) {#each getValues(item) as value, idx}
    function create_each_block_1$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_if_block_2$2, create_if_block_3$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*idx*/ ctx[10] == 0) return 0;
    		if (/*idx*/ ctx[10] == 1) return 1;
    		if (/*idx*/ ctx[10] == 4) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(25:6) {#each getValues(item) as value, idx}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#each filtered(data_value, items) as item}
    function create_each_block$3(ctx) {
    	let show_if = !needRequirements(/*data_value*/ ctx[1], /*item*/ ctx[5]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, items*/ 3) show_if = !needRequirements(/*data_value*/ ctx[1], /*item*/ ctx[5]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value, items*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(22:0) {#each filtered(data_value, items) as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = filtered(/*data_value*/ ctx[1], /*items*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getValues, filtered, data_value, items, needRequirements*/ 7) {
    				each_value = filtered(/*data_value*/ ctx[1], /*items*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemBars', slots, []);
    	
    	
    	let data_value;
    	let { items = [] } = $$props;

    	GameData.subscribe(data => {
    		$$invalidate(1, data_value = data);
    	});

    	const getValues = item => {
    		return [
    			item.name,
    			item.upgradePrice,
    			item.effectDescription,
    			item.level,
    			item.expense
    		];
    	};

    	const writable_props = ['items'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemBars> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => item.select();
    	const click_handler_1 = item => item.upgrade();

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		GameData,
    		Coins,
    		filtered,
    		getRequiredString,
    		needRequirements,
    		data_value,
    		items,
    		getValues
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(1, data_value = $$props.data_value);
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, data_value, getValues, click_handler, click_handler_1];
    }

    class ItemBars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { items: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemBars",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get items() {
    		throw new Error("<ItemBars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ItemBars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tabs/Shop.svelte generated by Svelte v3.42.2 */
    const file$6 = "src/tabs/Shop.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (32:4) <ProgressTable headers={["Boats", "Price"]}>
    function create_default_slot_1(ctx) {
    	let boatbars;
    	let current;

    	boatbars = new BoatBars({
    			props: {
    				boats: /*getBoats*/ ctx[1](/*data_value*/ ctx[0].boatData)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(boatbars.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(boatbars, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const boatbars_changes = {};
    			if (dirty & /*data_value*/ 1) boatbars_changes.boats = /*getBoats*/ ctx[1](/*data_value*/ ctx[0].boatData);
    			boatbars.$set(boatbars_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(boatbars.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(boatbars.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(boatbars, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(32:4) <ProgressTable headers={[\\\"Boats\\\", \\\"Price\\\"]}>",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#if needRequirements(data_value, boat)}
    function create_if_block_1$3(ctx) {
    	let div;
    	let requiredbar;
    	let t;
    	let current;

    	requiredbar = new RequiredBar({
    			props: { taskOrItem: /*boat*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(requiredbar.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "w-full mb-8");
    			add_location(div, file$6, 36, 8, 1130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(requiredbar, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const requiredbar_changes = {};
    			if (dirty & /*data_value*/ 1) requiredbar_changes.taskOrItem = /*boat*/ ctx[6];
    			requiredbar.$set(requiredbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(requiredbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(requiredbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(requiredbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(36:6) {#if needRequirements(data_value, boat)}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#each filtered(data_value, getBoats(data_value.boatData)) as boat}
    function create_each_block_1$2(ctx) {
    	let show_if = needRequirements(/*data_value*/ ctx[0], /*boat*/ ctx[6]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value*/ 1) show_if = needRequirements(/*data_value*/ ctx[0], /*boat*/ ctx[6]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(35:4) {#each filtered(data_value, getBoats(data_value.boatData)) as boat}",
    		ctx
    	});

    	return block;
    }

    // (45:4) <ProgressTable       headers={["Item", "Upgrade", "Effect", "Level", "Expense/Day"]}     >
    function create_default_slot$1(ctx) {
    	let itembars;
    	let current;

    	itembars = new ItemBars({
    			props: {
    				items: /*getItems*/ ctx[2](/*data_value*/ ctx[0].itemData)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(itembars.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(itembars, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const itembars_changes = {};
    			if (dirty & /*data_value*/ 1) itembars_changes.items = /*getItems*/ ctx[2](/*data_value*/ ctx[0].itemData);
    			itembars.$set(itembars_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itembars.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itembars.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itembars, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(45:4) <ProgressTable       headers={[\\\"Item\\\", \\\"Upgrade\\\", \\\"Effect\\\", \\\"Level\\\", \\\"Expense/Day\\\"]}     >",
    		ctx
    	});

    	return block;
    }

    // (51:6) {#if needRequirements(data_value, item)}
    function create_if_block$5(ctx) {
    	let requiredbar;
    	let current;

    	requiredbar = new RequiredBar({
    			props: { taskOrItem: /*item*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(requiredbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(requiredbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const requiredbar_changes = {};
    			if (dirty & /*data_value*/ 1) requiredbar_changes.taskOrItem = /*item*/ ctx[3];
    			requiredbar.$set(requiredbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(requiredbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(requiredbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(requiredbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(51:6) {#if needRequirements(data_value, item)}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#each filtered(data_value, getItems(data_value.itemData)) as item}
    function create_each_block$2(ctx) {
    	let show_if = needRequirements(/*data_value*/ ctx[0], /*item*/ ctx[3]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value*/ 1) show_if = needRequirements(/*data_value*/ ctx[0], /*item*/ ctx[3]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(50:4) {#each filtered(data_value, getItems(data_value.itemData)) as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let progresstable0;
    	let t0;
    	let t1;
    	let div1;
    	let progresstable1;
    	let t2;
    	let current;

    	progresstable0 = new ProgressTable({
    			props: {
    				headers: ["Boats", "Price"],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = filtered(/*data_value*/ ctx[0], /*getBoats*/ ctx[1](/*data_value*/ ctx[0].boatData));
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	progresstable1 = new ProgressTable({
    			props: {
    				headers: ["Item", "Upgrade", "Effect", "Level", "Expense/Day"],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = filtered(/*data_value*/ ctx[0], /*getItems*/ ctx[2](/*data_value*/ ctx[0].itemData));
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(progresstable0.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			create_component(progresstable1.$$.fragment);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$6, 30, 2, 857);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$6, 43, 2, 1251);
    			attr_dev(div2, "class", "w-full h-full bg-gray-700 p-2 mt-2");
    			add_location(div2, file$6, 29, 0, 806);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(progresstable0, div0, null);
    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(progresstable1, div1, null);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const progresstable0_changes = {};

    			if (dirty & /*$$scope, data_value*/ 513) {
    				progresstable0_changes.$$scope = { dirty, ctx };
    			}

    			progresstable0.$set(progresstable0_changes);

    			if (dirty & /*filtered, data_value, getBoats, needRequirements*/ 3) {
    				each_value_1 = filtered(/*data_value*/ ctx[0], /*getBoats*/ ctx[1](/*data_value*/ ctx[0].boatData));
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const progresstable1_changes = {};

    			if (dirty & /*$$scope, data_value*/ 513) {
    				progresstable1_changes.$$scope = { dirty, ctx };
    			}

    			progresstable1.$set(progresstable1_changes);

    			if (dirty & /*filtered, data_value, getItems, needRequirements*/ 5) {
    				each_value = filtered(/*data_value*/ ctx[0], /*getItems*/ ctx[2](/*data_value*/ ctx[0].itemData));
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresstable0.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(progresstable1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresstable0.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(progresstable1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(progresstable0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(progresstable1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Shop', slots, []);
    	
    	
    	let data_value;

    	GameData.subscribe(data => {
    		$$invalidate(0, data_value = data);
    	});

    	const getBoats = boatData => {
    		let boatArr = [];

    		boatData.forEach(boat => {
    			boatArr.push(boat);
    		});

    		return boatArr;
    	};

    	const getItems = itemData => {
    		let itemArr = [];

    		itemData.forEach(item => {
    			itemArr.push(item);
    		});

    		return itemArr;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Shop> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ProgressTable,
    		GameData,
    		Coins,
    		filtered,
    		getRequiredString,
    		needRequirements,
    		BoatBars,
    		ItemBars,
    		RequiredBar,
    		data_value,
    		getBoats,
    		getItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(0, data_value = $$props.data_value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data_value, getBoats, getItems];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/SkillBars.svelte generated by Svelte v3.42.2 */
    const file$5 = "src/components/SkillBars.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (27:2) {#if !needRequirements(data_value, skill)}
    function create_if_block$4(ctx) {
    	let tr;
    	let xpbar;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	xpbar = new XpBar({
    			props: {
    				name: /*skill*/ ctx[5].name,
    				width: /*skill*/ ctx[5].barWidth,
    				selected: /*data_value*/ ctx[1].currentSkill.name === /*skill*/ ctx[5].name
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*getValues*/ ctx[3](/*skill*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*skill*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			create_component(xpbar.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(tr, "class", "cursor-pointer");
    			add_location(tr, file$5, 27, 4, 747);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component(xpbar, tr, null);
    			append_dev(tr, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const xpbar_changes = {};
    			if (dirty & /*data_value, skills*/ 3) xpbar_changes.name = /*skill*/ ctx[5].name;
    			if (dirty & /*data_value, skills*/ 3) xpbar_changes.width = /*skill*/ ctx[5].barWidth;
    			if (dirty & /*data_value, skills*/ 3) xpbar_changes.selected = /*data_value*/ ctx[1].currentSkill.name === /*skill*/ ctx[5].name;
    			xpbar.$set(xpbar_changes);

    			if (dirty & /*getValues, filtered, data_value, skills*/ 11) {
    				each_value_1 = /*getValues*/ ctx[3](/*skill*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(xpbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(xpbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(xpbar);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(27:2) {#if !needRequirements(data_value, skill)}",
    		ctx
    	});

    	return block;
    }

    // (34:6) {#each getValues(skill) as value}
    function create_each_block_1$1(ctx) {
    	let td;
    	let t_value = /*value*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$5, 34, 8, 1005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, skills*/ 3 && t_value !== (t_value = /*value*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(34:6) {#each getValues(skill) as value}",
    		ctx
    	});

    	return block;
    }

    // (26:0) {#each filtered(data_value, skills) as skill}
    function create_each_block$1(ctx) {
    	let show_if = !needRequirements(/*data_value*/ ctx[1], /*skill*/ ctx[5]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value, skills*/ 3) show_if = !needRequirements(/*data_value*/ ctx[1], /*skill*/ ctx[5]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value, skills*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:0) {#each filtered(data_value, skills) as skill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = filtered(/*data_value*/ ctx[1], /*skills*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*setCurrent, filtered, data_value, skills, getValues, needRequirements*/ 15) {
    				each_value = filtered(/*data_value*/ ctx[1], /*skills*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SkillBars', slots, []);
    	
    	
    	let data_value;
    	let { skills = [] } = $$props;

    	GameData.subscribe(data => {
    		$$invalidate(1, data_value = data);
    	});

    	const setCurrent = name => {
    		setCurrentSkill(name);
    	};

    	const getValues = skill => {
    		// ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]
    		return [
    			skill.level,
    			skill.effectDescription,
    			formatNumber(skill.xpGain),
    			formatNumber(skill.xpLeft),
    			skill.maxLevel
    		];
    	};

    	const writable_props = ['skills'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SkillBars> was created with unknown prop '${key}'`);
    	});

    	const click_handler = skill => setCurrent(skill.name);

    	$$self.$$set = $$props => {
    		if ('skills' in $$props) $$invalidate(0, skills = $$props.skills);
    	};

    	$$self.$capture_state = () => ({
    		GameData,
    		setCurrentSkill,
    		XpBar,
    		filtered,
    		formatNumber,
    		needRequirements,
    		data_value,
    		skills,
    		setCurrent,
    		getValues
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(1, data_value = $$props.data_value);
    		if ('skills' in $$props) $$invalidate(0, skills = $$props.skills);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [skills, data_value, setCurrent, getValues, click_handler];
    }

    class SkillBars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { skills: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillBars",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get skills() {
    		throw new Error("<SkillBars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skills(value) {
    		throw new Error("<SkillBars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tabs/Skills.svelte generated by Svelte v3.42.2 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/tabs/Skills.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (40:6) <ProgressTable {headers}>
    function create_default_slot(ctx) {
    	let skillbars;
    	let current;

    	skillbars = new SkillBars({
    			props: {
    				skills: /*getSkills*/ ctx[2](/*data_value*/ ctx[0].skillsData, /*headers*/ ctx[4][0])
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(skillbars.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skillbars, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const skillbars_changes = {};
    			if (dirty & /*data_value*/ 1) skillbars_changes.skills = /*getSkills*/ ctx[2](/*data_value*/ ctx[0].skillsData, /*headers*/ ctx[4][0]);
    			skillbars.$set(skillbars_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skillbars.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skillbars.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skillbars, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(40:6) <ProgressTable {headers}>",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#if needRequirements(data_value, skill)}
    function create_if_block$3(ctx) {
    	let requiredbar;
    	let current;

    	requiredbar = new RequiredBar({
    			props: { taskOrItem: /*skill*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(requiredbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(requiredbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const requiredbar_changes = {};
    			if (dirty & /*data_value*/ 1) requiredbar_changes.taskOrItem = /*skill*/ ctx[7];
    			requiredbar.$set(requiredbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(requiredbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(requiredbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(requiredbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(44:8) {#if needRequirements(data_value, skill)}",
    		ctx
    	});

    	return block;
    }

    // (43:6) {#each filtered(data_value, getSkills(data_value.skillsData, headers[0])) as skill}
    function create_each_block_1(ctx) {
    	let show_if = needRequirements(/*data_value*/ ctx[0], /*skill*/ ctx[7]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data_value*/ 1) show_if = needRequirements(/*data_value*/ ctx[0], /*skill*/ ctx[7]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data_value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(43:6) {#each filtered(data_value, getSkills(data_value.skillsData, headers[0])) as skill}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#each allHeaders as headers}
    function create_each_block(ctx) {
    	let div;
    	let progresstable;
    	let t0;
    	let t1;
    	let current;

    	progresstable = new ProgressTable({
    			props: {
    				headers: /*headers*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = filtered(/*data_value*/ ctx[0], /*getSkills*/ ctx[2](/*data_value*/ ctx[0].skillsData, /*headers*/ ctx[4][0]));
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progresstable.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(div, "class", "mb-3");
    			add_location(div, file$4, 38, 4, 1021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progresstable, div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progresstable_changes = {};

    			if (dirty & /*$$scope, data_value*/ 1025) {
    				progresstable_changes.$$scope = { dirty, ctx };
    			}

    			progresstable.$set(progresstable_changes);

    			if (dirty & /*filtered, data_value, getSkills, allHeaders, needRequirements*/ 7) {
    				each_value_1 = filtered(/*data_value*/ ctx[0], /*getSkills*/ ctx[2](/*data_value*/ ctx[0].skillsData, /*headers*/ ctx[4][0]));
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresstable.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresstable.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progresstable);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:2) {#each allHeaders as headers}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	let each_value = /*allHeaders*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "w-full h-full bg-gray-700 p-2 mt-2");
    			add_location(div, file$4, 36, 0, 936);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filtered, data_value, getSkills, allHeaders, needRequirements*/ 7) {
    				each_value = /*allHeaders*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);
    	
    	
    	let data_value;
    	let commonHeaders = ["Level", "Effect", "Xp/day", "Xp left", "Max Level"];
    	let allHeaders = [[]];

    	onMount(() => {
    		Object.keys(skillCategories).forEach(key => {
    			allHeaders.push([key, ...commonHeaders]);
    		});
    	});

    	GameData.subscribe(data => {
    		$$invalidate(0, data_value = data);
    	});

    	const getSkills = (skills, category) => {
    		let skillArr = [];

    		skills.forEach(skill => {
    			if (skill.baseData.category == category) {
    				skillArr.push(skill);
    			}
    		});

    		return skillArr;
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ProgressTable,
    		GameData,
    		skillCategories,
    		SkillBars,
    		onMount,
    		filtered,
    		getRequiredString,
    		needRequirements,
    		RequiredBar,
    		data_value,
    		commonHeaders,
    		allHeaders,
    		getSkills
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(0, data_value = $$props.data_value);
    		if ('commonHeaders' in $$props) commonHeaders = $$props.commonHeaders;
    		if ('allHeaders' in $$props) $$invalidate(1, allHeaders = $$props.allHeaders);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data_value, allHeaders, getSkills];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/tabs/Settings.svelte generated by Svelte v3.42.2 */
    const file$3 = "src/tabs/Settings.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Settings!";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Reset Full Game";
    			attr_dev(p, "class", "p-10 bg-gray-500 text-white text-xl font-bold w-full");
    			add_location(p, file$3, 9, 2, 201);
    			attr_dev(button, "class", "btn bg-gray-800 border-red-500 border-2 text-red-500 font-bold");
    			add_location(button, file$3, 10, 2, 281);
    			attr_dev(div, "class", "bg-gray-white w-full h-full");
    			add_location(div, file$3, 8, 0, 157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", hardReset, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	
    	let data_value;

    	GameData.subscribe(data => {
    		data_value = data;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GameData, hardReset, data_value });

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) data_value = $$props.data_value;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Sidebar.svelte generated by Svelte v3.42.2 */
    const file$2 = "src/Sidebar.svelte";

    // (46:4) {#if currentlyFishing}
    function create_if_block_2$1(ctx) {
    	let span0;
    	let t0;
    	let coins0;
    	let t1;
    	let span1;
    	let t2;
    	let coins1;
    	let current;

    	coins0 = new Coins({
    			props: {
    				amount: /*getNet*/ ctx[4](/*currentlyFishing*/ ctx[2].income, getTotalExpenses(/*data_value*/ ctx[0])),
    				negative: /*negative*/ ctx[5](/*currentlyFishing*/ ctx[2].income, getTotalExpenses(/*data_value*/ ctx[0]))
    			},
    			$$inline: true
    		});

    	coins1 = new Coins({
    			props: {
    				amount: /*currentlyFishing*/ ctx[2].income
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("Net/day:\n\n        ");
    			create_component(coins0.$$.fragment);
    			t1 = space();
    			span1 = element("span");
    			t2 = text("Income/day: ");
    			create_component(coins1.$$.fragment);
    			attr_dev(span0, "class", "text-blue-400");
    			add_location(span0, file$2, 46, 6, 1339);
    			attr_dev(span1, "class", "text-green-400");
    			add_location(span1, file$2, 57, 6, 1634);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			mount_component(coins0, span0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t2);
    			mount_component(coins1, span1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coins0_changes = {};
    			if (dirty & /*currentlyFishing, data_value*/ 5) coins0_changes.amount = /*getNet*/ ctx[4](/*currentlyFishing*/ ctx[2].income, getTotalExpenses(/*data_value*/ ctx[0]));
    			if (dirty & /*currentlyFishing, data_value*/ 5) coins0_changes.negative = /*negative*/ ctx[5](/*currentlyFishing*/ ctx[2].income, getTotalExpenses(/*data_value*/ ctx[0]));
    			coins0.$set(coins0_changes);
    			const coins1_changes = {};
    			if (dirty & /*currentlyFishing*/ 4) coins1_changes.amount = /*currentlyFishing*/ ctx[2].income;
    			coins1.$set(coins1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins0.$$.fragment, local);
    			transition_in(coins1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins0.$$.fragment, local);
    			transition_out(coins1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			destroy_component(coins0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			destroy_component(coins1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(46:4) {#if currentlyFishing}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#if currentlyFishing}
    function create_if_block_1$2(ctx) {
    	let xpbar;
    	let t0;
    	let p;
    	let current;

    	xpbar = new XpBar({
    			props: {
    				name: /*currentlyFishing*/ ctx[2].name,
    				width: /*currentlyFishing*/ ctx[2].barWidth,
    				level: /*currentlyFishing*/ ctx[2].level,
    				selected: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(xpbar.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "Currently Fishing";
    			attr_dev(p, "class", "text-lg text-gray-400");
    			add_location(p, file$2, 74, 6, 2103);
    		},
    		m: function mount(target, anchor) {
    			mount_component(xpbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const xpbar_changes = {};
    			if (dirty & /*currentlyFishing*/ 4) xpbar_changes.name = /*currentlyFishing*/ ctx[2].name;
    			if (dirty & /*currentlyFishing*/ 4) xpbar_changes.width = /*currentlyFishing*/ ctx[2].barWidth;
    			if (dirty & /*currentlyFishing*/ 4) xpbar_changes.level = /*currentlyFishing*/ ctx[2].level;
    			xpbar.$set(xpbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(xpbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(xpbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(xpbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(68:4) {#if currentlyFishing}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if currentSkill}
    function create_if_block$2(ctx) {
    	let xpbar;
    	let current;

    	xpbar = new XpBar({
    			props: {
    				name: /*currentSkill*/ ctx[3].name,
    				width: /*currentSkill*/ ctx[3].barWidth,
    				level: /*currentSkill*/ ctx[3].level,
    				selected: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(xpbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(xpbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const xpbar_changes = {};
    			if (dirty & /*currentSkill*/ 8) xpbar_changes.name = /*currentSkill*/ ctx[3].name;
    			if (dirty & /*currentSkill*/ 8) xpbar_changes.width = /*currentSkill*/ ctx[3].barWidth;
    			if (dirty & /*currentSkill*/ 8) xpbar_changes.level = /*currentSkill*/ ctx[3].level;
    			xpbar.$set(xpbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(xpbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(xpbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(xpbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(79:4) {#if currentSkill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div9;
    	let div0;
    	let p0;
    	let t0_value = calculatedAge(/*data_value*/ ctx[0].day) + "";
    	let t0;
    	let t1;
    	let div1;
    	let button;
    	let t2_value = (/*data_value*/ ctx[0].paused ? "Play" : "Pause") + "";
    	let t2;
    	let t3;
    	let div2;
    	let p1;
    	let t5;
    	let coins0;
    	let t6;
    	let div3;
    	let t7;
    	let span;
    	let t8;
    	let coins1;
    	let t9;
    	let div4;
    	let t10;
    	let div5;
    	let t11;
    	let p2;
    	let t13;
    	let div8;
    	let div6;
    	let input0;
    	let input0_checked_value;
    	let t14;
    	let label0;
    	let t16;
    	let div7;
    	let input1;
    	let input1_checked_value;
    	let t17;
    	let label1;
    	let current;
    	let mounted;
    	let dispose;

    	coins0 = new Coins({
    			props: { amount: /*coins*/ ctx[1], large: true },
    			$$inline: true
    		});

    	let if_block0 = /*currentlyFishing*/ ctx[2] && create_if_block_2$1(ctx);

    	coins1 = new Coins({
    			props: {
    				amount: getTotalExpenses(/*data_value*/ ctx[0])
    			},
    			$$inline: true
    		});

    	let if_block1 = /*currentlyFishing*/ ctx[2] && create_if_block_1$2(ctx);
    	let if_block2 = /*currentSkill*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			button = element("button");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "Coins";
    			t5 = space();
    			create_component(coins0.$$.fragment);
    			t6 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			span = element("span");
    			t8 = text("Expense/day: ");
    			create_component(coins1.$$.fragment);
    			t9 = space();
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t10 = space();
    			div5 = element("div");
    			if (if_block2) if_block2.c();
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Current Skill";
    			t13 = space();
    			div8 = element("div");
    			div6 = element("div");
    			input0 = element("input");
    			t14 = space();
    			label0 = element("label");
    			label0.textContent = "Auto Train";
    			t16 = space();
    			div7 = element("div");
    			input1 = element("input");
    			t17 = space();
    			label1 = element("label");
    			label1.textContent = "Auto Promote Fish";
    			attr_dev(p0, "class", "text-lg");
    			add_location(p0, file$2, 32, 4, 888);
    			attr_dev(div0, "class", "m-3 flex");
    			add_location(div0, file$2, 31, 2, 861);
    			attr_dev(button, "class", "px-9 py-4 bg-gray-700 hover:bg-gray-800 text-white");
    			add_location(button, file$2, 35, 4, 990);
    			attr_dev(div1, "class", "m-3 flex flex-col");
    			add_location(div1, file$2, 34, 2, 954);
    			attr_dev(p1, "class", "text-xl");
    			add_location(p1, file$2, 41, 4, 1192);
    			attr_dev(div2, "class", "m-3 flex flex-col");
    			add_location(div2, file$2, 40, 2, 1156);
    			attr_dev(span, "class", "text-red-500");
    			add_location(span, file$2, 61, 4, 1755);
    			attr_dev(div3, "class", "m-3 flex flex-col");
    			add_location(div3, file$2, 44, 2, 1274);
    			attr_dev(div4, "class", "m-3 flex flex-col");
    			add_location(div4, file$2, 66, 2, 1874);
    			attr_dev(p2, "class", "text-lg text-gray-400");
    			add_location(p2, file$2, 86, 4, 2400);
    			attr_dev(div5, "class", "m-3 flex flex-col");
    			add_location(div5, file$2, 77, 2, 2179);
    			attr_dev(input0, "class", "mr-4 h-6 w-6");
    			attr_dev(input0, "name", "autoTrain");
    			attr_dev(input0, "type", "checkbox");
    			input0.checked = input0_checked_value = /*data_value*/ ctx[0].autoTrain;
    			add_location(input0, file$2, 90, 6, 2552);
    			attr_dev(label0, "for", "autoTrain");
    			add_location(label0, file$2, 97, 6, 2723);
    			attr_dev(div6, "class", "flex items-center mb-1");
    			add_location(div6, file$2, 89, 4, 2509);
    			attr_dev(input1, "class", "mr-4 h-6 w-6");
    			attr_dev(input1, "name", "autoFish");
    			attr_dev(input1, "type", "checkbox");
    			input1.checked = input1_checked_value = /*data_value*/ ctx[0].autoFish;
    			add_location(input1, file$2, 100, 6, 2818);
    			attr_dev(label1, "for", "autoTrain");
    			add_location(label1, file$2, 107, 6, 2986);
    			attr_dev(div7, "class", "flex items-center");
    			add_location(div7, file$2, 99, 4, 2780);
    			attr_dev(div8, "class", "m-3 flex flex-col text-white");
    			add_location(div8, file$2, 88, 2, 2462);
    			attr_dev(div9, "class", "flex flex-col w-1/4 bg-gray-900 text-white mx-2");
    			add_location(div9, file$2, 30, 0, 797);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div9, t1);
    			append_dev(div9, div1);
    			append_dev(div1, button);
    			append_dev(button, t2);
    			append_dev(div9, t3);
    			append_dev(div9, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t5);
    			mount_component(coins0, div2, null);
    			append_dev(div9, t6);
    			append_dev(div9, div3);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, span);
    			append_dev(span, t8);
    			mount_component(coins1, span, null);
    			append_dev(div9, t9);
    			append_dev(div9, div4);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div9, t10);
    			append_dev(div9, div5);
    			if (if_block2) if_block2.m(div5, null);
    			append_dev(div5, t11);
    			append_dev(div5, p2);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, input0);
    			append_dev(div6, t14);
    			append_dev(div6, label0);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div7, input1);
    			append_dev(div7, t17);
    			append_dev(div7, label1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", togglePause, false, false, false),
    					listen_dev(input0, "change", toggleTrain, false, false, false),
    					listen_dev(input1, "change", toggleFish, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*data_value*/ 1) && t0_value !== (t0_value = calculatedAge(/*data_value*/ ctx[0].day) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data_value*/ 1) && t2_value !== (t2_value = (/*data_value*/ ctx[0].paused ? "Play" : "Pause") + "")) set_data_dev(t2, t2_value);
    			const coins0_changes = {};
    			if (dirty & /*coins*/ 2) coins0_changes.amount = /*coins*/ ctx[1];
    			coins0.$set(coins0_changes);

    			if (/*currentlyFishing*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*currentlyFishing*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t7);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const coins1_changes = {};
    			if (dirty & /*data_value*/ 1) coins1_changes.amount = getTotalExpenses(/*data_value*/ ctx[0]);
    			coins1.$set(coins1_changes);

    			if (/*currentlyFishing*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*currentlyFishing*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*currentSkill*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*currentSkill*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div5, t11);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*data_value*/ 1 && input0_checked_value !== (input0_checked_value = /*data_value*/ ctx[0].autoTrain)) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (!current || dirty & /*data_value*/ 1 && input1_checked_value !== (input1_checked_value = /*data_value*/ ctx[0].autoFish)) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coins0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(coins1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coins0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(coins1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(coins0);
    			if (if_block0) if_block0.d();
    			destroy_component(coins1);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);
    	
    	
    	let data_value;
    	let coins;
    	let currentlyFishing;
    	let currentSkill;

    	GameData.subscribe(data => {
    		$$invalidate(0, data_value = data);
    		$$invalidate(1, coins = data.coins);
    		$$invalidate(2, currentlyFishing = data.currentlyFishing);
    		$$invalidate(3, currentSkill = data.currentSkill);
    	});

    	const getNet = (income, expense) => {
    		if (negative(income, expense)) {
    			return expense - income;
    		}

    		return income - expense;
    	};

    	const negative = (income, expense) => {
    		if (income - expense < 0) {
    			return true;
    		}

    		return false;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		calculatedAge,
    		getIncomeMultipliers,
    		getTotalExpenses,
    		toggleTrain,
    		togglePause,
    		GameData,
    		toggleFish,
    		Coins,
    		XpBar,
    		data_value,
    		coins,
    		currentlyFishing,
    		currentSkill,
    		getNet,
    		negative
    	});

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) $$invalidate(0, data_value = $$props.data_value);
    		if ('coins' in $$props) $$invalidate(1, coins = $$props.coins);
    		if ('currentlyFishing' in $$props) $$invalidate(2, currentlyFishing = $$props.currentlyFishing);
    		if ('currentSkill' in $$props) $$invalidate(3, currentSkill = $$props.currentSkill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data_value, coins, currentlyFishing, currentSkill, getNet, negative];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/tabs/Reincarnation.svelte generated by Svelte v3.42.2 */
    const file$1 = "src/tabs/Reincarnation.svelte";

    // (15:2) {#if day > 365 * 60}
    function create_if_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "There is a glowing rock that is sparkling gold and silver. It is big\n      enough to sit upon and wonder.";
    			add_location(p, file$1, 15, 4, 353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(15:2) {#if day > 365 * 60}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if day >= 365 * 70}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Sit on the rock";
    			attr_dev(button, "class", "btn bg-gray-800 border-yellow-400 border-2 text-yellow-200 font-bold");
    			add_location(button, file$1, 21, 4, 514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", rebirthReset, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:2) {#if day >= 365 * 70}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let p;
    	let t1;
    	let t2;
    	let if_block0 = /*day*/ ctx[0] > 365 * 60 && create_if_block_1$1(ctx);
    	let if_block1 = /*day*/ ctx[0] >= 365 * 70 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Reincarnation!";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(p, "class", "p-10 bg-indigo-400 text-white text-xl font-bold w-full");
    			add_location(p, file$1, 11, 2, 233);
    			attr_dev(div, "class", "bg-gray-white w-full h-full");
    			add_location(div, file$1, 10, 0, 189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*day*/ ctx[0] > 365 * 60) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*day*/ ctx[0] >= 365 * 70) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reincarnation', slots, []);
    	
    	let data_value;
    	let day;

    	GameData.subscribe(data => {
    		data_value = data;
    		$$invalidate(0, day = data.day);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reincarnation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GameData, rebirthReset, data_value, day });

    	$$self.$inject_state = $$props => {
    		if ('data_value' in $$props) data_value = $$props.data_value;
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [day];
    }

    class Reincarnation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reincarnation",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.2 */
    const file = "src/App.svelte";

    // (71:10) {#if data_value.day > 365 * 50}
    function create_if_block_5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reincarnation";
    			attr_dev(button, "class", "btn");
    			toggle_class(button, "bg-blue-900", /*selectedTab*/ ctx[0] == "reincarnation");
    			add_location(button, file, 71, 12, 2679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button, "bg-blue-900", /*selectedTab*/ ctx[0] == "reincarnation");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(71:10) {#if data_value.day > 365 * 50}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {:else}
    function create_else_block(ctx) {
    	let settings;
    	let current;
    	settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(97:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (95:49) 
    function create_if_block_4(ctx) {
    	let reincarnation;
    	let current;
    	reincarnation = new Reincarnation({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(reincarnation.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(reincarnation, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reincarnation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reincarnation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(reincarnation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(95:49) ",
    		ctx
    	});

    	return block;
    }

    // (93:40) 
    function create_if_block_3(ctx) {
    	let shop;
    	let current;
    	shop = new Shop({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(shop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(shop, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(93:40) ",
    		ctx
    	});

    	return block;
    }

    // (91:48) 
    function create_if_block_2(ctx) {
    	let achievements;
    	let current;
    	achievements = new Achievements({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(achievements.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(achievements, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(achievements.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(achievements.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(achievements, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(91:48) ",
    		ctx
    	});

    	return block;
    }

    // (89:47) 
    function create_if_block_1(ctx) {
    	let gonefishing;
    	let current;
    	gonefishing = new GoneFishing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gonefishing.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gonefishing, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gonefishing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gonefishing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gonefishing, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(89:47) ",
    		ctx
    	});

    	return block;
    }

    // (87:8) {#if selectedTab == "skills"}
    function create_if_block(ctx) {
    	let skills;
    	let current;
    	skills = new Skills({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skills.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skills, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skills.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skills.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skills, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(87:8) {#if selectedTab == \\\"skills\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div4;
    	let sidebar;
    	let t2;
    	let div3;
    	let div1;
    	let div0;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let button3;
    	let t10;
    	let t11;
    	let button4;
    	let t13;
    	let div2;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let mounted;
    	let dispose;
    	sidebar = new Sidebar({ $$inline: true });
    	let if_block0 = /*data_value*/ ctx[1].day > 365 * 50 && create_if_block_5(ctx);

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedTab*/ ctx[0] == "skills") return 0;
    		if (/*selectedTab*/ ctx[0] == "goneFishing") return 1;
    		if (/*selectedTab*/ ctx[0] == "achievements") return 2;
    		if (/*selectedTab*/ ctx[0] == "shop") return 3;
    		if (/*selectedTab*/ ctx[0] == "reincarnation") return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Idle Fishing";
    			t1 = space();
    			div4 = element("div");
    			create_component(sidebar.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Skills";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Gone Fishing";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Achievements";
    			t8 = space();
    			button3 = element("button");
    			button3.textContent = "Shop";
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			button4 = element("button");
    			button4.textContent = "Settings";
    			t13 = space();
    			div2 = element("div");
    			if_block1.c();
    			attr_dev(h1, "class", "text-6xl text-center p-6");
    			add_location(h1, file, 43, 2, 1631);
    			attr_dev(button0, "class", "btn");
    			toggle_class(button0, "bg-blue-900", /*selectedTab*/ ctx[0] == "skills");
    			add_location(button0, file, 50, 10, 1911);
    			attr_dev(button1, "class", "btn");
    			toggle_class(button1, "bg-blue-900", /*selectedTab*/ ctx[0] == "goneFishing");
    			add_location(button1, file, 55, 10, 2085);
    			attr_dev(button2, "class", "btn");
    			toggle_class(button2, "bg-blue-900", /*selectedTab*/ ctx[0] == "achievements");
    			add_location(button2, file, 60, 10, 2275);
    			attr_dev(button3, "class", "btn");
    			toggle_class(button3, "bg-blue-900", /*selectedTab*/ ctx[0] == "shop");
    			add_location(button3, file, 65, 10, 2467);
    			attr_dev(div0, "class", "flex flex-row");
    			add_location(div0, file, 49, 8, 1873);
    			attr_dev(button4, "class", "btn");
    			toggle_class(button4, "bg-blue-900", /*selectedTab*/ ctx[0] == "settings");
    			add_location(button4, file, 78, 8, 2911);
    			attr_dev(div1, "class", "flex flex-row bg-gray-800 text-white justify-between");
    			add_location(div1, file, 48, 6, 1798);
    			attr_dev(div2, "class", "flex flex-col");
    			add_location(div2, file, 85, 6, 3093);
    			attr_dev(div3, "class", "flex flex-col mr-2 w-3/4 overflow-x-auto");
    			add_location(div3, file, 47, 4, 1737);
    			attr_dev(div4, "class", "flex flex-row");
    			add_location(div4, file, 44, 2, 1688);
    			attr_dev(main, "class", "bg-gray-600 min-h-screen text-white");
    			add_location(main, file, 42, 0, 1578);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div4);
    			mount_component(sidebar, div4, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(div0, t8);
    			append_dev(div0, button3);
    			append_dev(div0, t10);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t11);
    			append_dev(div1, button4);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(button4, "click", /*click_handler_5*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button0, "bg-blue-900", /*selectedTab*/ ctx[0] == "skills");
    			}

    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button1, "bg-blue-900", /*selectedTab*/ ctx[0] == "goneFishing");
    			}

    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button2, "bg-blue-900", /*selectedTab*/ ctx[0] == "achievements");
    			}

    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button3, "bg-blue-900", /*selectedTab*/ ctx[0] == "shop");
    			}

    			if (/*data_value*/ ctx[1].day > 365 * 50) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*selectedTab*/ 1) {
    				toggle_class(button4, "bg-blue-900", /*selectedTab*/ ctx[0] == "settings");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(sidebar);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	
    	let selectedTab = "skills";
    	let data_value;
    	let coins;

    	GameData.subscribe(data => {
    		$$invalidate(1, data_value = data);
    		coins = data.coins;
    	});

    	createData(data_value.fishingData, fishBaseData);
    	createData(data_value.skillsData, skillBaseData);
    	createData(data_value.itemData, itemBaseData);
    	createData(data_value.boatData, boatBaseData);
    	loadGameData();

    	const setCurrents = () => {
    		if (!data_value.currentSkill) {
    			setCurrentSkill("Strength");
    		}

    		if (!data_value.currentlyFishing) {
    			setCurrentlyFishing("Sun Fish");
    		}
    	};

    	setCurrents();

    	const updateGame = () => {
    		update(data_value.paused, data_value.autoTrain, data_value.autoFish);
    	};

    	const masterInterval = window.setInterval(updateGame, 1000 / updateSpeed);
    	const saveInterval = window.setInterval(() => saveGameData(data_value), 3000);

    	const selectTab = selected => {
    		$$invalidate(0, selectedTab = selected);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectTab("skills");
    	const click_handler_1 = () => selectTab("goneFishing");
    	const click_handler_2 = () => selectTab("achievements");
    	const click_handler_3 = () => selectTab("shop");
    	const click_handler_4 = () => selectTab("reincarnation");
    	const click_handler_5 = () => selectTab("settings");

    	$$self.$capture_state = () => ({
    		Achievements,
    		GoneFishing,
    		Shop,
    		Skills,
    		Settings,
    		Coins,
    		calculatedAge,
    		coinAmounts,
    		createData,
    		loadGameData,
    		saveGameData,
    		boatBaseData,
    		fishBaseData,
    		GameData,
    		itemBaseData,
    		skillBaseData,
    		updateSpeed,
    		togglePause,
    		update,
    		setCurrentSkill,
    		setCurrentlyFishing,
    		Sidebar,
    		Reincarnation,
    		selectedTab,
    		data_value,
    		coins,
    		setCurrents,
    		updateGame,
    		masterInterval,
    		saveInterval,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedTab' in $$props) $$invalidate(0, selectedTab = $$props.selectedTab);
    		if ('data_value' in $$props) $$invalidate(1, data_value = $$props.data_value);
    		if ('coins' in $$props) coins = $$props.coins;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedTab,
    		data_value,
    		selectTab,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: "world",
        },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
