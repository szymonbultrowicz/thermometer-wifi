import { generateAlerts } from './alert-generator';

describe('temperature', () => {
    it('both temperatures above treshold -> hould not generate alert', () => {
        const result = generateAlerts({
            temperature: 10,
        }, {
            temperature: 8,
        });
    
        expect(result).toEqual([]);
    });

    it('both temperatures below treshold -> should not generate alert', () => {
        const result = generateAlerts({
            temperature: -5,
        }, {
            temperature: -2,
        });
    
        expect(result).toEqual([]);
    });

    it('went below treshold -> alert', () => {
        const result = generateAlerts({
            temperature: 5,
        }, {
            temperature: -2,
        });
    
        expect(result).toEqual([{
            "resource": "temperature",
            "state": "low",
            "value": -2,
        }]);
    });

    it('reached treshold from above -> no alert', () => {
        const result = generateAlerts({
            temperature: 3.1,
        }, {
            temperature: 3,
        });
    
        expect(result).toEqual([]);
    });

    it('went below from treshold -> alert', () => {
        const result = generateAlerts({
            temperature: 3,
        }, {
            temperature: 2.9,
        });
    
        expect(result).toEqual([{
            "resource": "temperature",
            "state": "low",
            "value": 2.9,
        }]);
    });

    it('reached treshold from below -> no alert', () => {
        const result = generateAlerts({
            temperature: 2.9,
        }, {
            temperature: 3,
        });
    
        expect(result).toEqual([]);
    });

    it('went above from treshold -> alert', () => {
        const result = generateAlerts({
            temperature: 3,
        }, {
            temperature: 3.1,
        });
    
        expect(result).toEqual([{
            "resource": "temperature",
            "state": "ok",
            "value": 3.1,
        }]);
    });

    it('went above treshold -> alert', () => {
        const result = generateAlerts({
            temperature: -2,
        }, {
            temperature: 5,
        });
    
        expect(result).toEqual([{
            "resource": "temperature",
            "state": "ok",
            "value": 5,
        }]);
    });
});
