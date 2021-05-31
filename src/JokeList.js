import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import image from './laughing_emoji.png';
import './JokeList.css';

const joke_url = "https://icanhazdadjoke.com/";


class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        }
        this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));
        console.log(this.seenJokes)
        this.handleVote = this.handleVote.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    async componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.getJokes();
        }

    }
    async getJokes() {
        try {
            let jokes = []
            while (jokes.length < this.props.numJokesToGet) {
                let response = await axios.get(joke_url, { headers: { Accept: 'application/JSON' } });
                if (!this.seenJokes.has(response.data.joke)) {
                    jokes.push({ id: uuid(), text: response.data.joke, votes: 0 })
                } else {
                    console.log("Duplicate Found!")
                }
            }
            this.setState(state => (
                { jokes: [...state.jokes, ...jokes], loading: false }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
        } catch (e) {
            alert(e);
            this.setState({ loading: false })
        }

    }
    handleVote(id, delta) {
        this.setState(state => ({
            jokes: state.jokes.map(joke =>
                joke.id === id ? { ...joke, votes: joke.votes + delta } : joke
            )
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    }

    handleClick() {
        this.setState({ loading: true }, this.getJokes)
        //this.getJokes();
    }
    render() {
        if (this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"> <span>Dad</span> Jokes!</h1>
                    <img src={image} alt="" />
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>

                <div className="JokeList-jokes">
                    {jokes.map(joke => (
                        <Joke key={joke.id} votes={joke.votes} text={joke.text} upVote={() => this.handleVote(joke.id, 1)}
                            downVote={() => this.handleVote(joke.id, -1)} />
                    ))}
                </div>

            </div>
        )
    }
}

export default JokeList;
