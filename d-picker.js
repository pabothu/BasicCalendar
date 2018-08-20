var dPicker = (function () {
    var dpOptions = {
        triggerClass: 'date-picker-trigger',
        bodyClass: 'dp-body',
        headerClass: 'dp-header',
        weekClass: 'dp-week',
        yearClass: 'dp-year',
        monthClass: 'dp-month',
        dayContainerClass: 'dp-container',
        dpDayClass: 'dp-day',
        dpDayEmptyClass: 'dp-day-empty',
        headerTextClass: 'dp-header-text',
        dpDayEmptyContent: '&nbsp;',
        dateFormat: 'dd/MM/yyyy'
    };

    var dpLocal = {
        weekNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        html: {
            header: "<div class='" + dpOptions.yearClass + "'><<</div><div class='" + dpOptions.monthClass + "'><</div><span class='" + dpOptions.headerTextClass + "'></span><div class='" + dpOptions.monthClass + "'>></div><div class='" + dpOptions.yearClass + "'>>></div>",
            week: '<li>Sun</li><li>Mon</li><li>Tue</li><li>Wed</li><li>Thu</li><li>Fri</li><li>Sat</li>'
        }
    };

    function init() {
        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            dpOptions = updateDefaults(dpOptions, arguments[0]);
        }

        bindEvent(document.querySelectorAll('.' + dpOptions.triggerClass), 'click', function (e) {
            dpLocal.date = new Date();
            dpLocal.date.setDate(1);
            dpLocal.element = e.target;

            if (dpLocal.dpBody == undefined || dpLocal.dpBody == null) {
                buildUI();
                buildData();
                addEvent(document.querySelector('.' + dpOptions.headerClass), 'click', changeCalendar);
                addEvent(document.querySelector('.' + dpOptions.dayContainerClass), 'click', selectDate);
                showCalendar(e);
                addEvent(document, 'click', closeCalendar);
            }
        });
    }

    function updateDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    function showCalendar(e) {
        var pos = getPosition(e);
        dpLocal.dpBody.style.left = (pos.left + e.target.offsetWidth + 5) + 'px';
        dpLocal.dpBody.style.top = (pos.top) + 'px';
        dpLocal.dpBody.style.display = 'block';
    }

    function bindEvent(element, type, callback) {
        for (var i = 0; i < element.length; i++) {
            addEvent(element[i], type, callback);
        }
    }

    function addEvent(element, type, callback) {
        if (document.addEventListener) element.addEventListener(type, callback);
        else element.attachEvent('on' + type, callback);
    }

    function removeEvent(element, type, callback) {
        if (document.removeEventListener) element.removeEventListener(type, callback);
        else element.detachEvent('on' + type, callback);
    }

    function getPosition(e) {
        return { left: e.target.offsetLeft, top: e.target.offsetTop };
    }

    // Get Week and Month full names
    Date.prototype.getName = function (WM, isFullName) {
        if (WM === 'W') {
            return isFullName ? dpLocal.weekNames[this.getDay()] : dpLocal.weekNames[this.getDay()].substring(0, 3);
        }
        else if (WM === 'M') {
            return isFullName ? dpLocal.monthNames[this.getMonth()] : dpLocal.monthNames[this.getMonth()].substring(0, 3);
        }
    };

    // Build calendar skeleton
    function buildUI() {
        dpLocal.dpBody = newElement('div', dpOptions.bodyClass);
        dpLocal.dpBody.appendChild(newElement('div', dpOptions.headerClass, dpLocal.html.header));
        dpLocal.dpBody.appendChild(newElement('ul', dpOptions.weekClass, dpLocal.html.week));
        dpLocal.dpBody.appendChild(newElement('div', dpOptions.dayContainerClass));
        document.body.appendChild(dpLocal.dpBody);
    }

    function buildData() {
        document.querySelector('.' + dpOptions.headerTextClass).innerText = dpLocal.date.getName('M', false) + '-' + dpLocal.date.getFullYear();
        var dayNumber = dpLocal.date.getDay();
        var noDaysInMonth = (new Date(dpLocal.date.getFullYear(), dpLocal.date.getMonth() + 1, 0)).getDate();
        var fragment = document.createDocumentFragment();

        for (var i = -dayNumber; i < noDaysInMonth; i++) {
            if (i < 0) {
                fragment.appendChild(newElement('span', dpOptions.dpDayEmptyClass, dpOptions.dpDayEmptyContent));
            }
            else {
                fragment.appendChild(newElement('div', dpOptions.dpDayClass, (i + 1).toString()));
            }
        }

        document.querySelector('.' + dpOptions.dayContainerClass).appendChild(fragment);
    }

    function newElement(element, className, innerHtml) {
        var _element = document.createElement(element);
        if (className != '') {
            _element.className = className;
        }
        if (typeof (innerHtml) != 'undefined') {
            _element.innerHTML = innerHtml;
        }
        return _element;
    }

    function changeCalendar(e) {
        e ? e.stopPropagation() : event.cancelBubble = true;
        if (e.target.nodeName === 'DIV' && (e.target.className === dpOptions.monthClass || e.target.className === dpOptions.yearClass)) {
            if (e.target.innerText === '<<') { dpLocal.date.setYear(dpLocal.date.getFullYear() - 1) }
            else if (e.target.innerText === '<') { dpLocal.date.setMonth(dpLocal.date.getMonth() - 1) }
            else if (e.target.innerText === '>') { dpLocal.date.setMonth(dpLocal.date.getMonth() + 1) }
            else if (e.target.innerText === '>>') { dpLocal.date.setYear(dpLocal.date.getFullYear() + 1) }
            document.querySelector('.' + dpOptions.dayContainerClass).innerHTML = '';
            buildData();
        }
    }

    function selectDate(e) {
        e ? e.stopPropagation() : event.cancelBubble = true;
        if (e.target.nodeName === 'DIV' && e.target.className === dpOptions.dpDayClass) {
            var formatedDate = new Date(dpLocal.date.getFullYear() + '-' + (dpLocal.date.getMonth() + 1) + '-' + e.target.innerText);
            dpLocal.element.value = formatedDate.formatedString(dpOptions.dateFormat);
            closeCalendar(e);
        }
    }

    Date.prototype.formatedString = function (formatStr) {
        if (formatStr === 'dd/MM/yyyy') {
            return this.getDate() + '/' + (this.getMonth() + 1) + '/' + this.getFullYear();
        }
        else if (formatStr === 'dd-MM-yyyy') {
            return this.getDate() + '-' + (this.getMonth() + 1) + '-' + this.getFullYear();
        }
        else if (formatStr === 'MM/dd/yyyy') {
            return (this.getMonth() + 1) + '/' + this.getDate() + '/' + this.getFullYear();
        }
        else if (formatStr === 'MM-dd-yyyy') {
            return (this.getMonth() + 1) + '-' + this.getDate() + '-' + this.getFullYear();
        }
        else if (formatStr === 'dd MMM yyyy') {
            return this.getDate() + ' ' + this.getName('M', false) + ' ' + this.getFullYear();
        }
        else {
            return this.getDate() + '/' + (this.getMonth() + 1) + '/' + this.getFullYear();
        }
    };

    function closeCalendar(e) {
        if (e.target.className !== dpOptions.bodyClass && e.target.className !== dpOptions.triggerClass) {
            document.querySelector('.' + dpOptions.bodyClass).remove();
            removeEvent(document, 'click', closeCalendar);
            dpLocal.dpBody = null;
        }
    }

    return {
        init: init
    }
}());