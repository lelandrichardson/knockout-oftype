(function(ko){
    var ctorKey = '__ko_typed_array_ctor__',
        underlyingKey = '__ko_typed_array_underlying__',
        extend = ko.utils.extend,
        each = ko.utils.arrayForEach,
        observableArray = ko.observableArray,
        toArray = function(args){
            return Array.prototype.slice.call(args, 0).sort();
        },
        cmap = function(array,Ctor){
            var i,
                length = array.length,
                results = [];
            for(i=0;i<length;i++){
                results.push(new Ctor(array[i]));
            }
            return results;
        },
        newMethods = {
            'splice': function () {
                var that = this[underlyingKey];
                var needToMap = false,
                    mappedArguments;
                if(arguments[2] !== undefined && !(arguments[2] instanceof that[ctorKey])){
                    needToMap = true;
                    mappedArguments = cmap(toArray(arguments).slice(2),that[ctorKey]);
                    mappedArguments.unshift(arguments[0],arguments[1]);
                }

                // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
                // (for consistency with mutating regular observables)
                var underlyingArray = that.peek();
                that.valueWillMutate();
                var methodCallResult = underlyingArray['splice'].apply(underlyingArray, needToMap ? mappedArguments : arguments);
                that.valueHasMutated();
                return methodCallResult;
            }
        };

    each(['remove','removeAll','destroy','destroyAll','replace'],function(methodName){
        newMethods[methodName] = function (valueOrPredicate) {
            var that = this[underlyingKey];
            that[methodName].apply(that,arguments);
        }
    });


    each(["push", "unshift"], function (methodName) {
        newMethods[methodName] = function () {
            var that = this[underlyingKey];
            var needToMap = false,
                mappedArguments;
            if(arguments[0] !== undefined && !(arguments[0] instanceof that[ctorKey])){
                needToMap = true;
                mappedArguments = cmap(toArray(arguments),that[ctorKey]);
            }

            // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
            // (for consistency with mutating regular observables)
            var underlyingArray = that.peek();
            that.valueWillMutate();
            var methodCallResult = underlyingArray[methodName].apply(underlyingArray, needToMap ? mappedArguments : arguments);
            that.valueHasMutated();
            return methodCallResult;
        };
    });


    observableArray.fn.ofType = function(Ctor){
        var underlying = this,
            interceptor = ko.computed({
                read: underlying,
                write: function(value){
                    if(!!value && value.length > 0 && !(value[0] instanceof underlying[ctorKey])){
                        value = cmap(value,underlying[ctorKey]);
                    }
                    underlying(value);
                }
            });

        extend(interceptor, observableArray.fn);
        extend(interceptor, newMethods);
        underlying[ctorKey] = Ctor;
        interceptor[underlyingKey] = underlying;

        return interceptor;
    };
    // allow this to be extended
    observableArray.fn.ofType.fn = newMethods;
})(ko);
