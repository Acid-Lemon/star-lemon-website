const error = require("../types/error");

class RuleHandler {
    constructor(args, name, rule_name, rule_config) {
        let func = Reflect.getPrototypeOf(this)[rule_name];
        if (!func) {
            throw_handle_error(`unknown rule: ${rule_name}`);
        }

        func(args, name, rule_config);
    }

    type(args, name, rule_type) {
        if (typeof rule_type !== "string") {
            throw TypeError(`rules[${name}]: value of rule[type] is a ${typeof rule_type}, not a string`);
        }

        if (typeof args[name] !== rule_type) {
            throw_handle_error(`args[${name}] invalid. expect type ${rule_type}, but got type ${typeof args[name]}`);
        }
    }

    equal(args, name, rule_val) {
        if (args[name] !== rule_val) {
            throw_handle_error(`args[${name}] invalid.`);
        }
    }

    within(args, name, rule_val) {
        if (!Array.isArray(rule_val)) {
            throw TypeError(`rules[${name}]: value of rule[within] is ${rule_val}, not an array`);
        }

        if (!rule_val.includes(args[name])) {
            throw_handle_error(`args[${name}] invalid. not within the rule value`);
        }
    }

    start_with(args, name, rule_val) {
        if (typeof args[name] !== "string") {
            throw TypeError(`rules[${name}]: args[${name}] is not a string, but a ${typeof args[name]}`);
        }

        if (typeof rule_val !== "string") {
            throw TypeError(`rules[${name}]: value of rule[start_with] is ${rule_val}, not a string`);
        }

        if (!args[name].startsWith(rule_val)) {
            throw_handle_error(`args[${name}] invalid. not start with the rule`);
        }
    }

    start_within(args, name, rule_val) {
        if (typeof args[name] === "string") {
            throw TypeError(`args[${name}] invalid. args[${name}] is not a string`)
        }

        if (!Array.isArray(rule_val)) {
            throw TypeError(`rules[${name}]: value of rule[within] is ${rule_val}, not an array`);
        }

        for (let rule of rule_val) {
            if (typeof rule !== "string") {
                throw TypeError(`rules[${name}]: value of rule[start_within] -- ${rule} is a ${typeof rule}, not a string`);
            }

            if (args[name].startsWith(rule)) {
                return;
            }
        }

        throw_handle_error(`args[${name}] invalid. not start with any allowed value`);
    }

    length(args, name, rules) {
        if (typeof rules !== "object") {
            throw TypeError(`rules[${name}]: value of rule[length] is not an object`);
        }

        let prop = args[name];
        if (!prop.hasOwnProperty("length")) {
            throw_handle_error(`args[${name}] invalid without length property.`);
        }

        let len = prop.length;

        for (let rule of Object.entries(Object(rules))) {
            let [length_rule_name, length_rule_val] = rule;
            switch (length_rule_name) {
                case "equal":
                    if (len !== length_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length ${length_rule_val}, but got length ${len}`);
                    }
                    return;
                case "min":
                    if (len < length_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length >= ${length_rule_val}, but got length ${len}`);
                    }
                    break;

                case "max":
                    if (len > length_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length <= ${length_rule_val}, but got length ${len}`);
                    }
                    break;
                default:
                    throw TypeError(`rules[${name}]>rules[length]: unknown rule[${length_rule_name}]`);
            }
        }
    }

    math(args, name, rules) {
        if (typeof rules !== "object") {
            throw TypeError(`rules[${name}]: value of rule[length] is not an object`);
        }

        let arg = args[name];

        for (let rule of Object.entries(Object(rules))) {
            let [math_rule_name, math_rule_val] = rule;
            switch (math_rule_name) {
                case "equal":
                    if (arg !== math_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length ${math_rule_val}, but got length ${arg}`);
                    }
                    return;
                case "min":
                    if (arg < math_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length >= ${math_rule_val}, but got length ${arg}`);
                    }
                    break;

                case "max":
                    if (arg > math_rule_val) {
                        throw_handle_error(`args[${name}] invalid. expect length <= ${math_rule_val}, but got length ${arg}`);
                    }
                    break;
                default:
                    throw TypeError(`rules[${name}]>rules[length]: unknown rule[${math_rule_name}]`);
            }
        }
    }

    regex(args, name, re) {
        if (!(re instanceof RegExp)) {
            if (!re instanceof String) {
                throw TypeError(`rules[${name}]: value of rule[regex] is not a RegExp or RegExp string`);
            }

            try {
                re = new RegExp(re);
            } catch (_err) {
                throw TypeError(`rules[${name}]: value of rule[regex] is not a valid RegExp string`);
            }
        }

        if (!re.test(args[name])) {
            throw_handle_error(`args[${name}] invalid.`);
        }
    }

    not_null(args, name, bool_val) {
        if (bool_val) {
            if (args[name] === null || args[name] === undefined) {
                throw_handle_error(`args[${name}] invalid. expect not null`);
            }
        } else {
            if (args[name] !== null && args[name] !== undefined) {
                throw_handle_error(`args[${name}] invalid. expect null`);
            }
        }
    }

    customize(args, name, func) {
        if (typeof func !== "function") {
            throw TypeError(`rules[${name}]: value of rule[customize] is not a function`);
        }

        if (!func(args, name)) {
            throw_handle_error(`args[${name}] invalid.`);
        }
    }
}

function throw_handle_error(message) {
    throw {
        code: error.codes.invalid_args,
        message,
        customize: true
    };
}


function validate(args, rules) {
    if (typeof args !== "object" || typeof rules !== "object") {
        throw TypeError("obj or rules is not an object");
    }

    for (let [name, rule] of Object.entries(rules)) {
        if (typeof rule !== "object") {
            throw TypeError(`config of ${name} is not an object`);
        }

        if (rule.hasOwnProperty("undefined_able")) {
            if (args[name] === undefined) {
                if (rule["undefined_able"] === true) {
                    continue;
                }

                if (rule["undefined_able"] === false) {
                    throw TypeError(`args[${name}] invalid. expect not undefined`);
                }
            }

            delete rule["undefined_able"];
        }

        if (rule.hasOwnProperty("null_able")) {
            if (args[name] === null) {
                if (rule["null_able"] === true) {
                    continue;
                }

                if (rule["null_able"] === false) {
                    throw TypeError(`args[${name}] invalid. expect not null`);
                }
            }

            delete rule["null_able"];
        }

        for (let [rule_name, rule_val] of Object.entries(Object(rule))) {
            new RuleHandler(args, name, rule_name, rule_val);
        }
    }

    let checked_obj = {};
    for (let [name] of Object.entries(rules)) {
        checked_obj[name] = args[name];
    }
    return checked_obj;
}

module.exports = {
    validate
}
