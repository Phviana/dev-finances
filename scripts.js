
const Modal = {
    openOrCloseModal() {
        document.querySelector('.modal-overlay').classList.toggle('active');
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all:Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        this.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        let income = 0;
        this.all.forEach(transaction => {
            if (transaction.amount > 0)
                income += transaction.amount
        })
        return income
    },
    expenses() {
        let expense = 0;
        this.all.forEach(transaction => {
            if (transaction.amount < 0)
            expense += transaction.amount
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody')
    ,
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
                    <td class="description">${transaction.description}</td>
                    <td class=${CSSClass}>${amount}</td>
                    <td class="date">${transaction.date}</td>
                    <td>
                         <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remove Transaction">
                     </td>
                `
        return html;
    },
    updateBalance() {
        document.querySelector('#total-incomes').innerHTML = Utils.formatCurrency(Transaction.incomes());

        document.querySelector('#total-display').innerHTML = Utils.formatCurrency(Transaction.total());

        document.querySelector('#total-expenses').innerHTML = Utils.formatCurrency(Transaction.expenses());
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString('en-US', {
            style: "currency",
            currency: "EUR"
        })

        return signal + value;
    },
    formatAmount(value){
        value = value * 100
        return Math.round(value)

    },
    formatDate(date){
        
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const App = {
    intit(){
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload(){
        DOM.clearTransactions()
        App.intit()
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return{
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },
    formatData(){
        let { description, amount, date } = this.getValues();

        amount  = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        description = description.trim()

        return {
            description,
            amount,
            date
        }
    },
    validateFields(){
        let { description, amount, date } = this.getValues();
        
        if (description.trim() === "" || amount.trim()  === "" || date.trim() === "") {
            throw new Error("Pleas fill all the fields")
        }

    },
    clearFields(){
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },
    submit(e){
        e.preventDefault()

        try {
            this.validateFields()
            const transaction = Form.formatData()

            Transaction.add(transaction)

            this.clearFields()

            Modal.openOrCloseModal()

        } catch (error) {
            alert(error.message)
        }
    }
}

App.intit()

